export const cryptographyHintProcessor = `
const { parentPort } = require('worker_threads');
const fs = require('fs');

parentPort.on('message', async (job) => {

    const { data } = job;
    const { file, rules } = data;

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
