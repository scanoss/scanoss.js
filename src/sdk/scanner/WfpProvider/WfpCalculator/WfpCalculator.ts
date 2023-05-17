import fs from 'fs';
import { Worker } from 'worker_threads';

import { ScannableItem } from '../../Scannable/ScannableItem';
import { ScannerCfg } from '../../ScannerCfg';
import { ScannerEvents, ScannerInput, WinnowingMode } from '../../ScannerTypes';

import { FingerprintPackage } from '../FingerprintPackage';
import { IWfpProviderInput, WfpProvider } from '../WfpProvider';

const stringWorker = `
const { parentPort } = require('worker_threads');

parentPort.on('message', async (scannableItem) => {

  let fingerprint;
  if ( scannableItem.winnowingMode === "FULL_WINNOWING") {
    fingerprint = wfp_for_content(
      scannableItem.content,
      scannableItem.contentSource,
      scannableItem.maxSizeWfp
    );
  } else if (scannableItem.winnowingMode === "FULL_WINNOWING_HPSM") {
    fingerprint = wfp_hpsm_for_content(
      scannableItem.content,
      scannableItem.contentSource,
      scannableItem.maxSizeWfp
    );
  } else if (scannableItem.winnowingMode === "WINNOWING_ONLY_MD5") {
    fingerprint = wfp_only_md5(
      scannableItem.content,
      scannableItem.contentSource
    );
  }

  scannableItem.fingerprint = fingerprint;
  parentPort.postMessage(scannableItem);

  });

  /**
  * Winnowing and HPSM algorithm begins
  */

const crypto = require('crypto');
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
  return input.slice(0, maxSize)
}

function toHexString(byteArray) {
  return Array.from(byteArray, function(byte) {
    return ('0' + (byte & 0xFF).toString(16)).slice(-2);
  }).join('')
}

function calc_hpsm(content) {
  let list_normalized = [];    //Array of numbers
  let crc_lines = [];  //Array of numbers that represent the crc8_maxim for each line of the file

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
  return "hpsm=" + toHexString(crc_lines)
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
  wfp = wfp.replace(/file=.*/, "")
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
  let wfp = wfp_for_content(content, contentSource, maxSize)
  let hpsm = calc_hpsm(content)   //Returns a string
  let wfp_hpsm_joined = join_wfp_hpsm(wfp, hpsm)
  return truncate_string(wfp_hpsm_joined, maxSize)
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

/**
* CRC8_MAXIM algorithm begins
*/


//=============================================================================
// Implementation of CRC-8/MAXIM-DOW,CRC-8/MAXIM,DOW-CRC.
// Notes: Code ported from C Auto-generated by http://crc.drque.net/
//=============================================================================

//Table size
const CRC8_MAXIM_DOW_TABLE_SIZE = 0x100
const CRC8_MAXIM_DOW_POLYNOMIAL = 0x8C // 0x31 reflected
const CRC8_MAXIM_DOW_INITIAL = 0x00 // 0x00 reflected
const CRC8_MAXIM_DOW_FINAL = 0x00 // 0x00 reflected

let crc8_MAXIM_DOW_Table = []

/**
 * Compute CRC of byte without lookup tables.
 *
 * @param {number} crc Current CRC or initial value
 * @param {number} byte New byte to accumulate.
 * @returns {number} Updated CRC.
 */
function crc8_MAXIM_DOW_ByteNoTable(crc, byte) {
  crc ^= byte;
  for (let count = 0; count<8; count++) {
    const isSet = (crc & 0x01)
    crc >>= 1;
    if (isSet) crc ^= CRC8_MAXIM_DOW_POLYNOMIAL
  }
  return crc
}

/**
 * Create the lookup table.
 * Note: Must be called before any table based CRC calculations can be done.
 */
function crc8_MAXIM_DOW_GenerateTable() {
  for(let i = 0; i<CRC8_MAXIM_DOW_TABLE_SIZE; i++) {
    crc8_MAXIM_DOW_Table.push(crc8_MAXIM_DOW_ByteNoTable(0, i))
  }
}

/**
 * Update CRC by byte.
 *
 * @param {number} crc Initial CRC.
 * @param {number} byte New byte to accumulate.
 * @returns {number} Updated CRC.
 */
function crc8_MAXIM_DOW_Byte( crc, byte )
{
  const index = byte ^ crc;
  return crc8_MAXIM_DOW_Table[ index ] ^ ( crc >> 8 );
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
  for (let index = 0; index < buffer.length ; index ++) {
    crc = crc8_MAXIM_DOW_Byte(crc, buffer[index])
  }
  crc ^= CRC8_MAXIM_DOW_FINAL;
  return crc;
}
`;

export class WfpCalculator extends WfpProvider {
  private fileList: any;

  private fileListIndex: number;

  private continue: boolean;

  constructor(scannerCfg = new ScannerCfg()) {
    super();
    this.scannerCfg = scannerCfg;
  }

  init() {
    super.init();
    this.continue = true;
    this.fileList = [];
    this.fileListIndex = 0;
  }

  prepareWorker() {
    this.worker = new Worker(stringWorker, { eval: true });
    this.worker.on('message', async (scannableItem) => {
      this.fingerprintPacker(scannableItem.fingerprint);
      await this.nextStepMachine();
    });
  }

  recoveryIndex() {
    // Files: contains all files winnowed but not packed yet
    const files = new FingerprintPackage(this.wfp, this.folderRoot).getFilesFingerprinted();
    if (files.length) {
      const lastFileWinnowed = files[files.length - 1];
      let i = 0;
      while (i <= files.length && lastFileWinnowed !== this.fileList[this.fileListIndex - i]) {
        i += 1;
      }
      // If file already winnowed cannot be found in fileList emit an error.
      if (i > files.length) {
        this.sendError('Cannot recovery index on winnower');
        return -1;
      }
      this.fileListIndex -= i;
      if (this.fileList[this.fileListIndex] === lastFileWinnowed) this.fileListIndex += 1;
    }
    return 0;
  }

  forceStopWorker() {
    this.worker.removeAllListeners();
    this.worker.terminate();
  }

  protected processPackedWfp(content) {
    const fingerprint = new FingerprintPackage(content, this.folderRoot);
    this.sendFingerprint(fingerprint);
  }

  async getNextScannableItem() {
    if (this.fileListIndex >= this.fileList.length) {
      this.emit(ScannerEvents.WINNOWING_STATUS, (this.fileListIndex) % this.scannerCfg.WINNOWING_REPORT_STATUS_AFTER_X)
      return null;
    }
    const path = this.fileList[this.fileListIndex];
    const contentSource = path.replace(`${this.folderRoot}`, '');
    const content = await fs.promises.readFile(path);
    this.fileListIndex += 1;
    if (!(this.fileListIndex % this.scannerCfg.WINNOWING_REPORT_STATUS_AFTER_X))
      this.emit(ScannerEvents.WINNOWING_STATUS, this.scannerCfg.WINNOWING_REPORT_STATUS_AFTER_X);

    const scannable = new ScannableItem(content, contentSource, this.winnowingMode, this.scannerCfg.WFP_FILE_MAX_SIZE);
    return scannable;
  }

  async nextStepMachine() {
    if (!this.continue) return;
    const scannableItem = await this.getNextScannableItem();
    if (scannableItem) this.worker.postMessage(scannableItem);
    else {
      this.finishWinnowing();
      this.forceStopWorker();
      this.sendLog('[ SCANNER ]: WFP Calculator finished...');
    }
  }


  public start(params: IWfpProviderInput): Promise<void> {

    if(!params.fileList) this.sendError('File list is required');
    this.sendLog('[ SCANNER ]: WFP Calculator starting...');

    this.init();
    this.prepareWorker();

    if(params.winnowingMode) this.setWinnowingMode(params.winnowingMode);
    if(params.obfuscate) this.obfuscate = params.obfuscate;

    this.pendingFiles = true;
    this.folderRoot = params.folderRoot;
    this.fileList = params.fileList;

    this.nextStepMachine();

    return this.finishPromise;
  }



  public pause(): void {
    this.sendLog('[ SCANNER ]: WFP Calculator paused...')
    this.continue = false;
  }

  public resume(): void {
    this.sendLog('[ SCANNER ]: WFP Calculator resumed...')
    this.continue = true;
    this.recoveryIndex();
    this.nextStepMachine();
  }

  public stop(): void {
    this.continue = false;
    this.pendingFiles = false;
    this.forceStopWorker();
    this.prepareWorker();
    this.init();
  }

}
