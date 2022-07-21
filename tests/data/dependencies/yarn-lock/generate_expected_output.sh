#!/bin/bash

# Command used to generate the expected output
scancode --json-pp - --package $1 | jq -c '.files[0].packages[0].dependencies[] | { "purl": .purl , "requirement": .requirement }'
