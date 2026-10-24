import fs from 'fs';
import path from 'path';
import { SyftWasmParser } from '../../sdk/Dependencies/SyftWasm/SyftWasmParser';
import { logger, Logger } from '../../sdk/Logger';
import { Tree } from '../../sdk/tree/Tree';
import { DependencyFilter } from '../../sdk/tree/Filters/DependencyFilter';
import { isFolder } from './helpers';
import { ILocalDependencies } from '../../sdk/Dependencies/LocalDependency/DependencyTypes';

export async function wasmTestHandler(rootPath: string, options: any): Promise<void> {
  logger.setLevel(Logger.Level.info);
  if (options.debug) logger.setLevel(Logger.Level.debug);

  // Normalize path
  rootPath = rootPath.replace(/\/$/, ''); // Remove trailing slash if exists
  rootPath = rootPath.replace(/^\./, process.env.PWD); // Convert relative path to absolute path

  console.log('🧪 Scanning dependencies with Syft WASM Parser...\n');

  try {
    // Initialize WASM parser
    const parser = new SyftWasmParser();
    await parser.init();

    logger.info('✓ WASM loaded successfully');
    logger.info(`✓ Version: ${parser.getVersion()}\n`);

    // Get file list
    let fileList: Array<string> = [];
    const pathIsFolder = await isFolder(rootPath);

    if (pathIsFolder) {
      logger.info(`Scanning folder: ${rootPath}`);
      const tree = new Tree(rootPath);
      tree.build();
      fileList = tree.getFileList(new DependencyFilter(''));
      logger.info(`Found ${fileList.length} dependency files\n`);
    } else {
      logger.info(`Scanning file: ${rootPath}`);
      fileList.push(rootPath);
    }

    if (fileList.length === 0) {
      console.log('⚠️  No dependency files found');
      return;
    }

    // Parse each file
    const results: ILocalDependencies = { files: [] };

    for (const filePath of fileList) {
      const fileName = path.basename(filePath);

      // Check if file is supported
      if (!parser.isSupported(filePath)) {
        logger.debug(`Skipping unsupported file: ${fileName}`);
        continue;
      }

      try {
        logger.info(`📄 Parsing ${fileName}...`);
        const fileContent = await fs.promises.readFile(filePath, 'utf8');
        const dependency = await parser.parseFile(fileContent, fileName);

        if (dependency.purls && dependency.purls.length > 0) {
          results.files.push({
            file: filePath,
            purls: dependency.purls,
          });

          console.log(`  ✓ Found ${dependency.purls.length} dependencies in ${fileName}`);
          if (options.debug) {
            dependency.purls.forEach((dep) => {
              console.log(`    - ${dep.purl}`);
            });
          }
        } else {
          logger.debug(`  ⚠️  No dependencies found in ${fileName}`);
        }
      } catch (error) {
        logger.error(`  ❌ Error parsing ${fileName}: ${error.message}`);
        continue;
      }
    }

    // Output results
    console.log(`\n✅ Scan complete! Found dependencies in ${results.files.length} files`);

    const outputData = JSON.stringify(results, null, 2);

    if (options.output) {
      await fs.promises.writeFile(options.output, outputData);
      console.log(`\n📝 Results written to: ${options.output}`);
    } else {
      console.log('\n' + outputData);
    }
  } catch (error) {
    console.error('❌ WASM scan failed:', error.message);
    if (options.debug) console.error(error);
    throw error;
  }
}
