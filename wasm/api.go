//go:build wasm
// +build wasm

package main

import (
	"context"
	"encoding/json"
	"fmt"
	"syscall/js"
)

func getVersion(this js.Value, args []js.Value) interface{} {
	return js.ValueOf(version)
}

func parseFile(this js.Value, args []js.Value) interface{} {
	// Get the actual arguments from the outer args
	if len(args) < 2 {
		return js.ValueOf("parseFile requires at least 2 arguments: path, content")
	}

	path := args[0].String()
	content := args[1].String()
	fileType := ""
	if len(args) >= 3 && !args[2].IsUndefined() {
		fileType = args[2].String()
	}

	// Create promise handler
	handler := js.FuncOf(func(this js.Value, promiseArgs []js.Value) interface{} {
		resolve := promiseArgs[0]
		reject := promiseArgs[1]

		go func() {
			defer func() {
				if r := recover(); r != nil {
					reject.Invoke(fmt.Sprintf("panic: %v", r))
				}
			}()

			input := FileInput{
				Path:    path,
				Content: content,
				Type:    fileType,
			}

			result := parseFileInternal(input)

			jsResult, err := structToJSValue(result)
			if err != nil {
				reject.Invoke(fmt.Sprintf("failed to convert result: %v", err))
				return
			}

			resolve.Invoke(jsResult)
		}()

		return nil
	})

	promiseConstructor := js.Global().Get("Promise")
	return promiseConstructor.New(handler)
}

func parseFiles(this js.Value, args []js.Value) interface{} {
	// Get the files array from arguments
	if len(args) < 1 {
		return js.ValueOf("parseFiles requires 1 argument: array of file objects")
	}

	filesArray := args[0]
	if !filesArray.InstanceOf(js.Global().Get("Array")) {
		return js.ValueOf("first argument must be an array")
	}

	length := filesArray.Length()
	inputs := make([]FileInput, length)

	for i := 0; i < length; i++ {
		fileObj := filesArray.Index(i)
		path := fileObj.Get("path").String()
		content := fileObj.Get("content").String()
		fileType := ""
		if typeVal := fileObj.Get("type"); !typeVal.IsUndefined() {
			fileType = typeVal.String()
		}

		inputs[i] = FileInput{
			Path:    path,
			Content: content,
			Type:    fileType,
		}
	}

	// Create promise handler
	handler := js.FuncOf(func(this js.Value, promiseArgs []js.Value) interface{} {
		resolve := promiseArgs[0]
		reject := promiseArgs[1]

		go func() {
			defer func() {
				if r := recover(); r != nil {
					reject.Invoke(fmt.Sprintf("panic: %v", r))
				}
			}()

			result := parseFilesInternal(inputs)

			jsResult, err := structToJSValue(result)
			if err != nil {
				reject.Invoke(fmt.Sprintf("failed to convert result: %v", err))
				return
			}

			resolve.Invoke(jsResult)
		}()

		return nil
	})

	promiseConstructor := js.Global().Get("Promise")
	return promiseConstructor.New(handler)
}

func parseFileInternal(input FileInput) ParseResult {
	return parseFilesInternal([]FileInput{input})
}

func parseFilesInternal(inputs []FileInput) ParseResult {
	result := ParseResult{
		Packages: make([]PackageInfo, 0),
		PURLs:    make([]string, 0),
	}

	ctx := context.Background()

	for _, input := range inputs {
		packages, err := parseFileWithSyft(ctx, input)
		if err != nil {
			result.Error = fmt.Sprintf("failed to parse %s: %v", input.Path, err)
			continue
		}

		result.Packages = append(result.Packages, packages...)
		for _, pkg := range packages {
			if pkg.PURL != "" {
				result.PURLs = append(result.PURLs, pkg.PURL)
			}
		}
	}

	return result
}

func structToJSValue(data interface{}) (js.Value, error) {
	jsonBytes, err := json.Marshal(data)
	if err != nil {
		return js.Undefined(), err
	}

	jsonString := string(jsonBytes)
	return js.Global().Get("JSON").Call("parse", jsonString), nil
}
