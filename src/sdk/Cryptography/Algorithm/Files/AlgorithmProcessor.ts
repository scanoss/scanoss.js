export const cryptographyAlgorithmProcessor = `
const { parentPort } = require('worker_threads');
const fs = require('fs');

parentPort.on('message', async (job) => {

    const MAX_FILE_SIZE = 2 * 1024 * 1024 * 1024;
    const { data } = job;
    const { file, rules, cryptoMapper } = data;

     const cryptoFound = new Array();
     const stats = await fs.promises.stat(file);
     if (stats.size > MAX_FILE_SIZE) {
      parentPort.postMessage({ file, algorithms:[] });
      return;
     }

      let content =  fs.readFileSync(file, 'utf-8');
       rules.forEach((value, key) => {
      try {
        const matches = content.match(value);
        if (matches) {
          cryptoFound.push(key);
        }
      } catch (e){
        console.error(e);
      }
    });
    const algorithms = [];
    cryptoFound.forEach((cf)=>{
      algorithms.push(cryptoMapper.get(cf));
    });
    parentPort.postMessage({ file, algorithms });
  });
`;
