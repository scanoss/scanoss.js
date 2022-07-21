#!/bin/bash

# Reads a go.sum from file and prints to stdout all objects with purls and requirements

# Example:
# Input: cloud.google.com/go v0.26.0/go.mod h1:aQUYkXzVsufM+DwF1aE+0xfcU+56JwCaLick0ClmMTw=
# Output: {purl: "pkg:golang/cloud.google.com/go", requirement: "v0.26.0"},

# This is used to create the expectedOutput for the go.sum test
# WARNING: This does not scape the special characters in the dep name



#clean blank spaces
file_content=$(sed '/^ *$/d' "$1")


purls_and_versions=$(echo "$file_content" | awk '{print "{purl:" "\"" "pkg:golang/"$1 "\"" ", requirement:" "\"" $2 "\"" "},"}')

#Delete go.mod substrings
results=${purls_and_versions//\/go.mod/}

echo "$results"
