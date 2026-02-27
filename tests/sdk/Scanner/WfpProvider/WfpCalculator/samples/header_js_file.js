// SPDX-License-Identifier: MIT
// Copyright (c) 2024, SCANOSS

import fs from 'fs';
import path from 'path';

function readFile(filePath) {
    return fs.readFileSync(filePath, 'utf-8');
}

module.exports = { readFile };