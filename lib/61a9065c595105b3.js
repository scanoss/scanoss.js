import { parentPort } from "worker_threads";
import * as crypto from "crypto";
parentPort.on("message", async (scannableItem) => {
    console.log("PRINTING FROM WORKER :)");
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiV2ZwQ2FsY3VsYXRvci53b3JrZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvc2RrL3NjYW5uZXIvV2ZwUHJvdmlkZXIvV2ZwQ2FsY3VsYXRvci9XZnBDYWxjdWxhdG9yLndvcmtlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFDNUMsT0FBTyxLQUFLLE1BQU0sTUFBTSxRQUFRLENBQUM7QUFFakMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxTQUFTLEVBQUUsS0FBSyxFQUFFLGFBQWEsRUFBRSxFQUFFO0lBQy9DLE9BQU8sQ0FBQyxHQUFHLENBQUMseUJBQXlCLENBQUMsQ0FBQztJQUN2QyxJQUFJLFdBQVcsQ0FBQztJQUNoQixJQUFJLGFBQWEsQ0FBQyxhQUFhLEtBQUssZ0JBQWdCLEVBQUU7UUFDcEQsV0FBVyxHQUFHLGVBQWUsQ0FBQyxhQUFhLENBQUMsT0FBTyxFQUFFLGFBQWEsQ0FBQyxhQUFhLEVBQUUsYUFBYSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0tBQzdHO1NBQU0sSUFBSSxhQUFhLENBQUMsYUFBYSxLQUFLLHFCQUFxQixFQUFFO1FBQ2hFLFdBQVcsR0FBRyxvQkFBb0IsQ0FBQyxhQUFhLENBQUMsT0FBTyxFQUFFLGFBQWEsQ0FBQyxhQUFhLEVBQUUsYUFBYSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0tBQ2xIO1NBQU0sSUFBSSxhQUFhLENBQUMsYUFBYSxLQUFLLG9CQUFvQixFQUFFO1FBQy9ELFdBQVcsR0FBRyxZQUFZLENBQUMsYUFBYSxDQUFDLE9BQU8sRUFBRSxhQUFhLENBQUMsYUFBYSxDQUFDLENBQUM7S0FDaEY7SUFFRCxhQUFhLENBQUMsV0FBVyxHQUFHLFdBQVcsQ0FBQztJQUN4QyxhQUFhLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQztJQUM3QixVQUFVLENBQUMsV0FBVyxDQUFDLGFBQWEsQ0FBQyxDQUFDO0FBQ3hD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