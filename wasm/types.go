//go:build wasm
// +build wasm

package main

const version = "wasm-syft-1.0.0"

// FileInput represents a single file to be parsed
type FileInput struct {
	Path    string `json:"path"`
	Content string `json:"content"`
	Type    string `json:"type,omitempty"`
}

// ParseResult represents the output from parsing
type ParseResult struct {
	Packages []PackageInfo `json:"packages"`
	PURLs    []string      `json:"purls"`
	Error    string        `json:"error,omitempty"`
}

// PackageInfo represents a discovered package
type PackageInfo struct {
	Name     string   `json:"name"`
	Version  string   `json:"version"`
	Type     string   `json:"type"`
	PURL     string   `json:"purl"`
	Language string   `json:"language,omitempty"`
	Licenses []string `json:"licenses,omitempty"`
}
