const crypto = require('crypto');
const { crc8_MAXIM_DOW_GenerateTable, crc8_MAXIM_DOW_Buffer } = require('./crc8_maxim')
const isWin = process.platform === 'win32';
const pathSeparator = isWin ? String.fromCharCode(92) : '/';

// Winnowing configuration. DO NOT CHANGE.
const GRAM = 30;
const WINDOW = 64;

// ASCII characters
const ASCII_0 = 48;
const ASCII_9 = 57;
const ASCII_A = 65;
const ASCII_Z = 90;
const ASCII_a = 97;
const ASCII_z = 122;
const ASCII_LF = 10;

function normalize(byte) {
  if (byte < ASCII_0 || byte > ASCII_z) {
    return 0;
  }
  if (byte <= ASCII_9 || byte >= ASCII_a) {
    return byte;
  }
  if (byte >= ASCII_A && byte <= ASCII_Z) {
    return byte + 32;
  }
  return 0;
}

function normalize_line(line) {
  let result = []
  for (let c of line) {
    result.push(normalize(c))
  }
  return result
}

function min_hex_array(array) {
  let min = 'ffffffff';
  for (let i = 0; i < array.length; i++) {
    if (array[i] < min) {
      min = array[i];
    }
  }
  return min;
}

function calc_wfp(contents, maxSize) {
  let gram = '';
  const window = [];
  let normalized = 0;
  let line = 1;
  let min_hash = 'ffffffff';
  let last_hash = 'ffffffff';
  let last_line = 0;
  let output = '';
  let gram_crc32 = 0;
  let wfp = '';

  for (let i = 0; i < contents.length; i++) {
    if(wfp.length > maxSize)
      return wfp;

    const byte = contents[i];
    if (byte == ASCII_LF) {
      line += 1;
      normalized = 0;
    } else {
      normalized = normalize(byte);
    }
    // Is this an useful byte?
    if (normalized) {
      gram += String.fromCharCode(normalized);

      if (gram.length >= GRAM) {
        gram_crc32 = crc32c_hex(gram);
        window.push(gram_crc32);

        if (window.length >= WINDOW) {
          min_hash = min_hex_array(window);
          if (min_hash !== last_hash) {
            // Hashing the hash will result in a better balanced output data set
            // as it will counter the winnowing effect which selects the "minimum"
            // hash in each window
            const min_hash_bytes_le = parseHexString(
              toLittleEndianCRCHex(min_hash)
            );
            const crc_hex = crc32c_for_bytes_hex(min_hash_bytes_le);

            if (last_line != line) {
              if (output.length > 0) {
                wfp += String(output) + String.fromCharCode(10);
              }
              output = String(line) + '=' + String(crc_hex);
            } else {
              output += ',' + String(crc_hex);
            }
            last_line = line;
            last_hash = min_hash;
          }
          window.shift();
        }
        gram = gram.slice(1);
      }
    }
  }
  if (output.length > 0) {
    wfp += String(output) + String.fromCharCode(10);
  }

  return wfp;
}

function parseHexString(str) {
  const result = [];
  while (str.length >= 2) {
    result.push(parseInt(str.substring(0, 2), 16));
    str = str.substring(2, str.length);
  }

  return result;
}

/**
 *
 * @param {string} hex
 */
function toLittleEndianCRCHex(hex) {
  return (
    hex.charAt(6) +
    hex.charAt(7) +
    hex.charAt(4) +
    hex.charAt(5) +
    hex.charAt(2) +
    hex.charAt(3) +
    hex.charAt(0) +
    hex.charAt(1)
  );
}

let CRC_TABLE = [];

function makeCRCTable() {
  let c;
  const crcTable = [];
  for (let n = 0; n < 256; n++) {
    c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0x82f63b78 ^ (c >>> 1) : c >>> 1;
    }
    crcTable[n] = c;
  }
  return crcTable;
}

function crc32c(str) {
  if (CRC_TABLE.length == 0) {
    CRC_TABLE = makeCRCTable();
  }
  let crc = 0 ^ -1;

  for (let i = 0; i < str.length; i++) {
    crc = (crc >>> 8) ^ CRC_TABLE[(crc ^ str.charCodeAt(i)) & 0xff];
  }

  return (crc ^ -1) >>> 0;
}

function crc32c_for_bytes(bytes) {
  if (CRC_TABLE.length == 0) {
    CRC_TABLE = makeCRCTable();
  }
  let crc = 0 ^ -1;

  for (let i = 0; i < bytes.length; i++) {
    crc = (crc >>> 8) ^ CRC_TABLE[(crc ^ bytes[i]) & 0xff];
  }

  return (crc ^ -1) >>> 0;
}

function crc32c_for_bytes_hex(bytes) {
  return crc32c_for_bytes(bytes).toString(16).padStart(8, '0');
}

function crc32c_hex(str) {
  return crc32c(str).toString(16).padStart(8, '0');
}



function truncate_string(input, maxSize){

  return ""
}

function toHexString(byteArray) {
  return Array.from(byteArray, function(byte) {
    return ('0' + (byte & 0xFF).toString(16)).slice(-2);
  }).join('')
}

function calc_hpsm(content) {


  let list_normalized = [];    //Array of numbers
  let crc_lines = [];  //Array of numbers that represent the crc8_maxim for each line of the file
  let byte = 0;

  let last_line = 0;
  crc8_MAXIM_DOW_GenerateTable();

  for(let i = 0; i<content.length; i++) {
    const c = content[i];
    if (c == ASCII_LF) {  //When there is a new line
      if (list_normalized.length) {
        crc_lines.push(crc8_MAXIM_DOW_Buffer(list_normalized))
        list_normalized=[];
      } else if(last_line+1 == i) {
        crc_lines.push(0xFF);
      } else if (i-last_line  > 1) {
        crc_lines.push(0x00)
      }
      last_line = i;
    } else {
      const c_normalized = normalize(c);
      if (c_normalized != 0)  list_normalized.push(c_normalized)
    }
  }
  return `hpsm=${toHexString(crc_lines)}`
}


















/*
Receives a wfp with the md5 line, a hpsm and joins both.

Example:
wfp = `file=508cb9dfbe1c7dca5ed24f124473f33d,300,asd.c
        11=b19bdbfa
        13=8fd738fa,b6f47c1e
        `
hpsm = `hpsm=1909ff06ff688630ff45a92b52f47eff3500ffff`

wfp_hpsm = `file=508cb9dfbe1c7dca5ed24f124473f33d,300,asd.c
            hpsm=1909ff06ff688630ff45a92b52f47eff3500ffff
            11=b19bdbfa
            13=8fd738fa,b6f47c1e`
 */
function join_wfp_hpsm(wfp, hpsm) {
  let header = wfp.match(/file\=.*/);
  header += "\n";
  header += hpsm;
  wfp.replace(/file\=.*/, "")
  return header + wfp;
}

function wfp_hpsm_for_content(content, contentSource, maxSize) {
  let wfp = wfp_for_content(content, contentSource, maxSize)
  let hpsm = calc_hpsm(content)
  let wfp_hpsm_joined = join_wfp_hpsm(wfp, hpsm)
  return wfp_hpsm_joined
}


function wfp_for_content(content, contentSource, maxSize) {
  let wfp = wfp_only_md5(content, contentSource);
  wfp += calc_wfp(content, maxSize);
  return wfp;
}

function wfp_only_md5(contents, contentSource) {
  const file_md5 = crypto.createHash('md5').update(contents).digest('hex');
  let wfp = 'file=' + String(file_md5) + ',' + String(contents.length) + ',' + String(contentSource)+ String.fromCharCode(10);
  return wfp;
}


function test() {
  let data = `typedef struct

  unsigned long used_memory;

  unsigned int uint_max;
  unsigned long ulong_max;

  json_settings settings;
  int first_pass;

  const json_char *ptr;
  unsigned int cur_line, cur_col;

} json_state;

static void *default_alloc(size_t size, int zero, void *user_data)
{
  return zero ? calloc(1, size) : malloc(size);
}

static void default_free(void *ptr, void *user_data)
{
  free(ptr);
}

static void *json_alloc(json_state *state, unsigned long size, int zero)
{
  if ((state->ulong_max - state->used_memory) < size)
    return 0;

  if (state->settings.max_memory && (state->used_memory += size) > state->settings.max_memory)
  {
    return 0;
  }

  return state->settings.mem_alloc(size, zero, state->settings.user_data);
}

static int new_value(json_state *state,
                     json_value **top, json_value **root, json_value **alloc,
                     json_type type)

`;

  const a = wfp_hpsm_for_content(Buffer.from(data), "mock", 64*1024*1024)
  console.log(a);
}

test()
