import { parentPort } from "worker_threads";
import * as crypto from "crypto";
parentPort.on("message", async (scannableItem) => {
    let fingerprint;
    if (scannableItem.winnowingMode === "FULL_WINNOWING") {
        fingerprint = wfp_for_content(scannableItem.content, scannableItem.contentSource, scannableItem.maxSizeWfp);
    }
    else if (scannableItem.winnowingMode === "FULL_WINNOWING_HPSM") {
        fingerprint = wfp_hpsm_for_content(scannableItem.content, scannableItem.contentSource, scannableItem.maxSizeWfp);
    }
    else if (scannableItem.winnowingMode === "WINNOWING_ONLY_MD5") {
        fingerprint = wfp_only_md5(scannableItem.content, scannableItem.contentSource);
    }
    scannableItem.fingerprint = fingerprint;
    scannableItem.content = null;
    parentPort.postMessage(scannableItem);
});
/**
 * Winnowing and HPSM algorithm begins
 */
const isWin = process.platform === "win32";
const pathSeparator = isWin ? String.fromCharCode(92) : "/";
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
function min_hex_array(array) {
    let min = "ffffffff";
    for (let i = 0; i < array.length; i++) {
        if (array[i] < min) {
            min = array[i];
        }
    }
    return min;
}
function calc_wfp(contents, maxSize) {
    let gram = "";
    const window = [];
    let normalized = 0;
    let line = 1;
    let min_hash = "ffffffff";
    let last_hash = "ffffffff";
    let last_line = 0;
    let output = "";
    let gram_crc32 = 0;
    let wfp = "";
    for (let i = 0; i < contents.length; i++) {
        if (wfp.length > maxSize)
            return wfp;
        const byte = contents[i];
        if (byte == ASCII_LF) {
            line += 1;
            normalized = 0;
        }
        else {
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
                        const min_hash_bytes_le = parseHexString(toLittleEndianCRCHex(min_hash));
                        const crc_hex = crc32c_for_bytes_hex(min_hash_bytes_le);
                        if (last_line != line) {
                            if (output.length > 0) {
                                wfp += String(output) + String.fromCharCode(10);
                            }
                            output = String(line) + "=" + String(crc_hex);
                        }
                        else {
                            output += "," + String(crc_hex);
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
    return (hex.charAt(6) +
        hex.charAt(7) +
        hex.charAt(4) +
        hex.charAt(5) +
        hex.charAt(2) +
        hex.charAt(3) +
        hex.charAt(0) +
        hex.charAt(1));
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
    return crc32c_for_bytes(bytes).toString(16).padStart(8, "0");
}
function crc32c_hex(str) {
    return crc32c(str).toString(16).padStart(8, "0");
}
function truncate_string(input, maxSize) {
    return input.slice(0, maxSize);
}
function toHexString(byteArray) {
    return Array.from(byteArray, function (byte) {
        return ("0" + (byte & 0xff).toString(16)).slice(-2);
    }).join("");
}
function calc_hpsm(content) {
    let list_normalized = []; //Array of numbers
    let crc_lines = []; //Array of numbers that represent the crc8_maxim for each line of the file
    let last_line = 0;
    crc8_MAXIM_DOW_GenerateTable();
    for (let i = 0; i < content.length; i++) {
        const c = content[i];
        if (c == ASCII_LF) {
            //When there is a new line
            if (list_normalized.length) {
                crc_lines.push(crc8_MAXIM_DOW_Buffer(list_normalized));
                list_normalized = [];
            }
            else if (last_line + 1 == i) {
                crc_lines.push(0xff);
            }
            else if (i - last_line > 1) {
                crc_lines.push(0x00);
            }
            last_line = i;
        }
        else {
            const c_normalized = normalize(c);
            if (c_normalized != 0)
                list_normalized.push(c_normalized);
        }
    }
    return "hpsm=" + toHexString(crc_lines);
}
/**
 * Create a wfp_hpsm package joining wfp (with md5 line) and a hpsm.
 *
 * Example:
 * wfp = file=508cb9dfbe1c7dca5ed24f124473f33d,300,asd.c
 *         11=b19bdbfa
 *
 * hpsm = hpsm=1909ff06ff688630ff45a92b52f47eff3500ffff
 *
 * wfp_hpsm = file=508cb9dfbe1c7dca5ed24f124473f33d,300,asd.c
 *             hpsm=1909ff06ff688630ff45a92b52f47eff3500ffff
 *             11=b19bdbfa
 *
 * @param {string} wfp Complete wfp string (with md5 line)
 * @param {string} hpsm
 * @returns {string}
 */
function join_wfp_hpsm(wfp, hpsm) {
    let header = wfp.match(/file=.*/);
    header += String.fromCharCode(10);
    header += hpsm;
    wfp = wfp.replace(/file=.*/, "");
    return header + wfp;
}
/**
 *
 * @param {Buffer} content
 * @param {string} contentSource
 * @param {number} maxSize
 * @returns {string}
 */
function wfp_hpsm_for_content(content, contentSource, maxSize) {
    let wfp = wfp_for_content(content, contentSource, maxSize);
    let hpsm = calc_hpsm(content); //Returns a string
    let wfp_hpsm_joined = join_wfp_hpsm(wfp, hpsm);
    return truncate_string(wfp_hpsm_joined, maxSize);
}
function wfp_for_content(content, contentSource, maxSize) {
    let wfp = wfp_only_md5(content, contentSource);
    wfp += calc_wfp(content, maxSize);
    return wfp;
}
function wfp_only_md5(contents, contentSource) {
    const file_md5 = crypto.createHash("md5").update(contents).digest("hex");
    let wfp = "file=" + String(file_md5) + "," + String(contents.length) + "," + String(contentSource) + String.fromCharCode(10);
    return wfp;
}
/**
 * CRC8_MAXIM algorithm begins
 */
//=============================================================================
// Implementation of CRC-8/MAXIM-DOW,CRC-8/MAXIM,DOW-CRC.
// Notes: Code ported from C Auto-generated by http://crc.drque.net/
//=============================================================================
//Table size
const CRC8_MAXIM_DOW_TABLE_SIZE = 0x100;
const CRC8_MAXIM_DOW_POLYNOMIAL = 0x8c; // 0x31 reflected
const CRC8_MAXIM_DOW_INITIAL = 0x00; // 0x00 reflected
const CRC8_MAXIM_DOW_FINAL = 0x00; // 0x00 reflected
let crc8_MAXIM_DOW_Table = [];
/**
 * Compute CRC of byte without lookup tables.
 *
 * @param {number} crc Current CRC or initial value
 * @param {number} byte New byte to accumulate.
 * @returns {number} Updated CRC.
 */
function crc8_MAXIM_DOW_ByteNoTable(crc, byte) {
    crc ^= byte;
    for (let count = 0; count < 8; count++) {
        const isSet = crc & 0x01;
        crc >>= 1;
        if (isSet)
            crc ^= CRC8_MAXIM_DOW_POLYNOMIAL;
    }
    return crc;
}
/**
 * Create the lookup table.
 * Note: Must be called before any table based CRC calculations can be done.
 */
function crc8_MAXIM_DOW_GenerateTable() {
    for (let i = 0; i < CRC8_MAXIM_DOW_TABLE_SIZE; i++) {
        crc8_MAXIM_DOW_Table.push(crc8_MAXIM_DOW_ByteNoTable(0, i));
    }
}
/**
 * Update CRC by byte.
 *
 * @param {number} crc Initial CRC.
 * @param {number} byte New byte to accumulate.
 * @returns {number} Updated CRC.
 */
function crc8_MAXIM_DOW_Byte(crc, byte) {
    const index = byte ^ crc;
    return crc8_MAXIM_DOW_Table[index] ^ (crc >> 8);
}
/**
 * Compute CRC of buffer.
 * Note: crc8_MAXIM_DOW_GenerateTable() must be called before use this function
 *
 * @param {Buffer} buffer Buffer with bytes to calculate CRC.
 * @returns {number} CRC
 */
function crc8_MAXIM_DOW_Buffer(buffer) {
    let crc = CRC8_MAXIM_DOW_INITIAL;
    for (let index = 0; index < buffer.length; index++) {
        crc = crc8_MAXIM_DOW_Byte(crc, buffer[index]);
    }
    crc ^= CRC8_MAXIM_DOW_FINAL;
    return crc;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiV2ZwQ2FsY3VsYXRvci53b3JrZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvc2RrL3NjYW5uZXIvV2ZwUHJvdmlkZXIvV2ZwQ2FsY3VsYXRvci9XZnBDYWxjdWxhdG9yLndvcmtlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFDNUMsT0FBTyxLQUFLLE1BQU0sTUFBTSxRQUFRLENBQUM7QUFFakMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxTQUFTLEVBQUUsS0FBSyxFQUFFLGFBQWEsRUFBRSxFQUFFO0lBQy9DLElBQUksV0FBVyxDQUFDO0lBQ2hCLElBQUksYUFBYSxDQUFDLGFBQWEsS0FBSyxnQkFBZ0IsRUFBRTtRQUNwRCxXQUFXLEdBQUcsZUFBZSxDQUFDLGFBQWEsQ0FBQyxPQUFPLEVBQUUsYUFBYSxDQUFDLGFBQWEsRUFBRSxhQUFhLENBQUMsVUFBVSxDQUFDLENBQUM7S0FDN0c7U0FBTSxJQUFJLGFBQWEsQ0FBQyxhQUFhLEtBQUsscUJBQXFCLEVBQUU7UUFDaEUsV0FBVyxHQUFHLG9CQUFvQixDQUFDLGFBQWEsQ0FBQyxPQUFPLEVBQUUsYUFBYSxDQUFDLGFBQWEsRUFBRSxhQUFhLENBQUMsVUFBVSxDQUFDLENBQUM7S0FDbEg7U0FBTSxJQUFJLGFBQWEsQ0FBQyxhQUFhLEtBQUssb0JBQW9CLEVBQUU7UUFDL0QsV0FBVyxHQUFHLFlBQVksQ0FBQyxhQUFhLENBQUMsT0FBTyxFQUFFLGFBQWEsQ0FBQyxhQUFhLENBQUMsQ0FBQztLQUNoRjtJQUVELGFBQWEsQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFDO0lBQ3hDLGFBQWEsQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDO0lBQzdCLFVBQVUsQ0FBQyxXQUFXLENBQUMsYUFBYSxDQUFDLENBQUM7QUFDeEMsQ0FBQyxDQUFDLENBQUM7QUFFSDs7R0FFRztBQUVILE1BQU0sS0FBSyxH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