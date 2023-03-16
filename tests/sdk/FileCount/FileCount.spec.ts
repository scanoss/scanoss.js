import { FileCount } from '../../../src/sdk/FileCount/FileCount';
import { IDirSummary } from '../../../src/sdk/FileCount/Interfaces';
import path from 'path';
import { Format } from '../../../src/sdk/FileCount/Interfaces';
import { expect } from 'chai';

describe('Suit test for FileCount', () => {

  it('Testing dir with files', async function() {
    const data = await FileCount.walk(path.join(__dirname, './samples/22036'), { output: Format.CSV});
    expect(data).equal('.ts,6,1\n');
  });


  it('Testing dir with hidden files in CSV formats', async function() {
    const data = await FileCount.walk(path.join(__dirname, './samples/16557'), { output: Format.CSV});
    expect(data).equal('.ts,3,1\n');
  });



});

