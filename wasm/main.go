//go:build wasm
// +build wasm

package main

import (
	"syscall/js"
)

func main() {
	// Keep the Go program running
	c := make(chan struct{})

	// Register JavaScript functions
	js.Global().Set("syftParseFile", js.FuncOf(parseFile))
	js.Global().Set("syftParseFiles", js.FuncOf(parseFiles))
	js.Global().Set("syftGetVersion", js.FuncOf(getVersion))

	<-c
}
