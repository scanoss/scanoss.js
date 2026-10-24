//go:build wasm
// +build wasm

package main

import (
	"context"
	"encoding/json"
	"fmt"
	"path/filepath"
	"regexp"
	"strings"
)

func parseFileWithSyft(ctx context.Context, input FileInput) ([]PackageInfo, error) {
	// Detect file type from path if not provided
	fileType := input.Type
	if fileType == "" {
		fileType = detectFileType(input.Path)
	}

	// Route to appropriate parser
	switch fileType {
	case "npm", "javascript", "js":
		return parseNPM(input.Content)
	case "python", "py":
		return parsePython(input.Content)
	case "go", "golang":
		return parseGoMod(input.Content)
	case "maven", "java":
		return parseMaven(input.Content)
	case "rust":
		return parseRust(input.Content)
	default:
		// Try to auto-detect from filename
		return parseByFilename(input.Path, input.Content)
	}
}

func detectFileType(path string) string {
	base := filepath.Base(path)

	switch base {
	case "package.json", "package-lock.json":
		return "npm"
	case "requirements.txt", "Pipfile.lock", "poetry.lock":
		return "python"
	case "go.mod", "go.sum":
		return "go"
	case "pom.xml", "build.gradle":
		return "maven"
	case "Cargo.toml", "Cargo.lock":
		return "rust"
	case "Gemfile.lock":
		return "ruby"
	case "composer.json":
		return "php"
	default:
		return "unknown"
	}
}

func parseByFilename(path, content string) ([]PackageInfo, error) {
	fileType := detectFileType(path)
	if fileType == "unknown" {
		return nil, fmt.Errorf("unknown file type: %s", path)
	}

	input := FileInput{Path: path, Content: content, Type: fileType}
	return parseFileWithSyft(context.Background(), input)
}

// parseNPM parses package.json
func parseNPM(content string) ([]PackageInfo, error) {
	var pkg struct {
		Name         string            `json:"name"`
		Version      string            `json:"version"`
		Dependencies map[string]string `json:"dependencies"`
	}

	if err := json.Unmarshal([]byte(content), &pkg); err != nil {
		return nil, fmt.Errorf("invalid package.json: %w", err)
	}

	packages := []PackageInfo{}

	// Add main package if it has a name
	if pkg.Name != "" && pkg.Version != "" {
		packages = append(packages, PackageInfo{
			Name:     pkg.Name,
			Version:  pkg.Version,
			Type:     "npm",
			PURL:     generateNPMPURL(pkg.Name, pkg.Version),
			Language: "javascript",
		})
	}

	// Add dependencies
	for name, version := range pkg.Dependencies {
		// Clean version (remove ^ ~ etc)
		cleanVer := strings.TrimLeft(version, "^~>=<")
		if cleanVer == "" || cleanVer == "*" {
			continue
		}

		packages = append(packages, PackageInfo{
			Name:     name,
			Version:  cleanVer,
			Type:     "npm",
			PURL:     generateNPMPURL(name, cleanVer),
			Language: "javascript",
		})
	}

	return packages, nil
}

// parsePython parses requirements.txt
func parsePython(content string) ([]PackageInfo, error) {
	packages := []PackageInfo{}

	lines := strings.Split(content, "\n")
	re := regexp.MustCompile(`^([a-zA-Z0-9_-]+)\s*([><=!]+)?\s*([0-9.]+)?`)

	for _, line := range lines {
		line = strings.TrimSpace(line)
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}

		matches := re.FindStringSubmatch(line)
		if len(matches) >= 2 {
			name := matches[1]
			version := ""
			if len(matches) >= 4 && matches[3] != "" {
				version = matches[3]
			}

			packages = append(packages, PackageInfo{
				Name:     strings.ToLower(name),
				Version:  version,
				Type:     "python",
				PURL:     generatePythonPURL(name, version),
				Language: "python",
			})
		}
	}

	return packages, nil
}

// parseGoMod parses go.mod
func parseGoMod(content string) ([]PackageInfo, error) {
	packages := []PackageInfo{}

	lines := strings.Split(content, "\n")
	inRequire := false

	for _, line := range lines {
		line = strings.TrimSpace(line)

		if strings.HasPrefix(line, "require") {
			inRequire = true
			line = strings.TrimPrefix(line, "require")
			line = strings.TrimSpace(line)
			if line == "(" {
				continue
			}
		}

		if inRequire && line == ")" {
			inRequire = false
			continue
		}

		if inRequire || strings.HasPrefix(line, "require ") {
			fields := strings.Fields(line)
			if len(fields) >= 2 {
				name := fields[0]
				version := fields[1]

				// Skip lines with 'require' keyword
				if name == "require" && len(fields) >= 3 {
					name = fields[1]
					version = fields[2]
				}

				packages = append(packages, PackageInfo{
					Name:     name,
					Version:  version,
					Type:     "golang",
					PURL:     generateGoPURL(name, version),
					Language: "go",
				})
			}
		}
	}

	return packages, nil
}

// parseMaven parses pom.xml (very basic)
func parseMaven(content string) ([]PackageInfo, error) {
	packages := []PackageInfo{}

	// Very simple XML parsing - just extract group/artifact/version
	groupRe := regexp.MustCompile(`<groupId>(.*?)</groupId>`)
	artifactRe := regexp.MustCompile(`<artifactId>(.*?)</artifactId>`)
	versionRe := regexp.MustCompile(`<version>(.*?)</version>`)

	groupMatches := groupRe.FindAllStringSubmatch(content, -1)
	artifactMatches := artifactRe.FindAllStringSubmatch(content, -1)
	versionMatches := versionRe.FindAllStringSubmatch(content, -1)

	// Match them up (this is simplified - real parsing would be more complex)
	maxLen := len(artifactMatches)
	for i := 0; i < maxLen && i < len(versionMatches); i++ {
		groupID := ""
		if i < len(groupMatches) {
			groupID = groupMatches[i][1]
		}

		artifactID := artifactMatches[i][1]
		version := versionMatches[i][1]

		// Skip if version is a property ${...}
		if strings.Contains(version, "${") {
			continue
		}

		packages = append(packages, PackageInfo{
			Name:     artifactID,
			Version:  version,
			Type:     "maven",
			PURL:     generateMavenPURL(groupID, artifactID, version),
			Language: "java",
		})
	}

	return packages, nil
}

// parseRust parses Cargo.toml (basic)
func parseRust(content string) ([]PackageInfo, error) {
	packages := []PackageInfo{}

	// Simple TOML parsing - look for [dependencies] section
	lines := strings.Split(content, "\n")
	inDeps := false

	for _, line := range lines {
		line = strings.TrimSpace(line)

		if line == "[dependencies]" {
			inDeps = true
			continue
		}

		if strings.HasPrefix(line, "[") {
			inDeps = false
		}

		if inDeps && strings.Contains(line, "=") {
			parts := strings.SplitN(line, "=", 2)
			if len(parts) == 2 {
				name := strings.TrimSpace(parts[0])
				versionPart := strings.Trim(strings.TrimSpace(parts[1]), "\"")

				packages = append(packages, PackageInfo{
					Name:     name,
					Version:  versionPart,
					Type:     "cargo",
					PURL:     generateCargoPURL(name, versionPart),
					Language: "rust",
				})
			}
		}
	}

	return packages, nil
}

// PURL generators
func generateNPMPURL(name, version string) string {
	namespace := ""
	pkgName := name

	// Handle scoped packages @scope/name
	if strings.HasPrefix(name, "@") {
		parts := strings.SplitN(name[1:], "/", 2)
		if len(parts) == 2 {
			namespace = parts[0]
			pkgName = parts[1]
		}
	}

	if namespace != "" {
		return fmt.Sprintf("pkg:npm/%s/%s@%s", namespace, pkgName, version)
	}
	return fmt.Sprintf("pkg:npm/%s@%s", pkgName, version)
}

func generatePythonPURL(name, version string) string {
	name = strings.ToLower(name)
	name = strings.ReplaceAll(name, "_", "-")
	if version == "" {
		return fmt.Sprintf("pkg:pypi/%s", name)
	}
	return fmt.Sprintf("pkg:pypi/%s@%s", name, version)
}

func generateGoPURL(name, version string) string {
	parts := strings.Split(name, "/")
	namespace := ""
	pkgName := name

	if len(parts) >= 3 {
		namespace = strings.Join(parts[0:2], "/")
		pkgName = parts[2]
	} else if len(parts) == 2 {
		namespace = parts[0]
		pkgName = parts[1]
	}

	if namespace != "" {
		return fmt.Sprintf("pkg:golang/%s/%s@%s", namespace, pkgName, version)
	}
	return fmt.Sprintf("pkg:golang/%s@%s", pkgName, version)
}

func generateMavenPURL(groupID, artifactID, version string) string {
	if groupID != "" {
		return fmt.Sprintf("pkg:maven/%s/%s@%s", groupID, artifactID, version)
	}
	return fmt.Sprintf("pkg:maven/%s@%s", artifactID, version)
}

func generateCargoPURL(name, version string) string {
	return fmt.Sprintf("pkg:cargo/%s@%s", name, version)
}
