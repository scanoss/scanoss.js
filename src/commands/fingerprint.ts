import { isFolder } from './helpers';
import { ScannerEvents, WfpCalculator, WinnowingMode } from '..';
import { Tree } from '../lib/tree/Tree';
import { FilterList } from '../lib/filters/filtering';
import {
  FingerprintPackage
} from '../lib/scanner/WfpProvider/FingerprintPackage';
import fs from 'fs';
import cliProgress from 'cli-progress';
import { IWfpProviderInput } from '../lib/scanner/WfpProvider/WfpProvider';
import { DependencyFilter } from '../lib/tree/Filters/DependencyFilter';


export async function fingerprintHandler(rootPath: string, options: any): Promise<void> {

  rootPath = rootPath.replace(/\/$/, '');  // Remove trailing slash if exists
  rootPath = rootPath.replace(/^\./, process.env.PWD);  // Convert relative path to absolute path.
  const pathIsFolder = await isFolder(rootPath);
  const wfpCalculator = new WfpCalculator();

  let filesToFingerprint: string[] = [];
  if (pathIsFolder) {
    const tree = new Tree(rootPath);
    tree.build();
    filesToFingerprint = tree.getFileList(new DependencyFilter(""));
  } else {
    filesToFingerprint.push(rootPath)
  }


  const optBar1 = { format: 'Fingerprinting Progress: [{bar}] {percentage}% | Fingerprinted {value} files of {total}' };
  const bar1 = new cliProgress.SingleBar(optBar1, cliProgress.Presets.shades_classic);
  bar1.start(filesToFingerprint.length, 0);

  let fingerprints = '';
  wfpCalculator.on(ScannerEvents.WINNOWING_NEW_CONTENT, (fingerprintPackage: FingerprintPackage) => {
    bar1.increment(fingerprintPackage.getNumberFilesFingerprinted());
    fingerprints = fingerprints.concat( fingerprintPackage.getContent() );
  });

  if (options.verbose)
    wfpCalculator.on(ScannerEvents.WINNOWER_LOG, (log: string) => {
      console.error(log);
    });

  wfpCalculator.on(ScannerEvents.WINNOWING_FINISHED, () => {
    bar1.stop();
    if(options.output) {
      fs.writeFileSync(options.output, fingerprints);
    } else {
      console.log(fingerprints);
    }
  });

  const wfpInput: IWfpProviderInput = {fileList: filesToFingerprint, folderRoot: rootPath}
  if(options.hpsm) wfpInput.winnowingMode = WinnowingMode.FULL_WINNOWING_HPSM;
  wfpCalculator.start(wfpInput);


}
