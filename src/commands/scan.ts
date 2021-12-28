import { Scanner, ScannerEvents, ScannerCfg } from '../index';


const scanner = new Scanner(new ScannerCfg());

scanner.on(ScannerEvents.SCANNER_LOG, (logText) => console.log(logText));

console.log("Scanning...");

