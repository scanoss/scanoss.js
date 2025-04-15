export const cryptographyHintProcessor = `
const { parentPort } = require('worker_threads');
const fs = require('fs');

parentPort.on('message', async (job) => {

    const MAX_FILE_SIZE = 2 * 1024 * 1024 * 1024;
    const { data } = job;
    const { file, rules } = data;

    const stats = await fs.promises.stat(file);
    if (stats.size > MAX_FILE_SIZE) {
       parentPort.postMessage({ file, hints: [] });
       return;
    }

    let content = fs.readFileSync(file, 'utf-8');
    const hints = [];
    rules.forEach((rule) => {
        for (const keyword of rule.keywords) {
            if (content.includes(keyword)) {
                const {id, name, description, url , category, purl } = rule;
                hints.push({ id, name, category, purl, description, url });
                break;
            }
        }
    });
    parentPort.postMessage({ file, hints });
 });
`;
