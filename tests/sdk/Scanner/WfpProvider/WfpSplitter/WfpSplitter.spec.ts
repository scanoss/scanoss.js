import { WfpSplitter } from '../../../../../src/sdk/scanner/WfpProvider/WfpSplitter/WfpSplitter'
import { ScannerEvents } from '../../../../../src/sdk/scanner/ScannerTypes'
import { ScannerCfg } from '../../../../../src/sdk/scanner/ScannerCfg'
import { FingerprintPackage } from '../../../../../src/sdk/scanner/WfpProvider/FingerprintPackage';
import fs from 'fs';
import path from 'path';



describe('Suit test for WfpSplitter Class', () => {

  it('Test ignore file list', async function () {

    const cfg = new ScannerCfg();
    cfg.WFP_FILE_MAX_SIZE = 64*1000;
    const wfpSplitter = new WfpSplitter(cfg);

    const filesToIgnore = ["/embedded/AIM6/xprt5.dll"];

    let wfp = ""
    wfpSplitter.on(ScannerEvents.WINNOWING_NEW_CONTENT, (f: FingerprintPackage) => {
      wfp += f.getContent();
    });

    await wfpSplitter.start({wfpPath: path.join(__dirname, '/samples/wfp.wfp'), fileList: filesToIgnore })

    //Verify that the filesToIgnore does not been proceeded
    for (const toIgnore of filesToIgnore) {
      if (wfp.indexOf(toIgnore) >= 0) {
        throw new Error(`File ${toIgnore} is in the generated wfp. Should be ignored`);
      }
    }

    console.log(wfp)

  });

});


