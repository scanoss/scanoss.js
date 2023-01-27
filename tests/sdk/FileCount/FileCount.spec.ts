import { FileCount } from  '../../../src/sdk/FileCount/FileCount'
import path from 'path';
describe('Suit test for FileCount', () => {

  it('Testing empty dir', async function() {

    let data = await FileCount.walk(path.join(__dirname, './samples/0'));
    console.log(data);

    data = await FileCount.walk(path.join(__dirname, './samples/28455'));
    console.log(data);
  });



});

