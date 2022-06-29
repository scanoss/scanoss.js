var assert = require('assert');
// @ts-ignore
//const wfp_for_content = require("./src/lib/scanner/WfpProvider/WfpCalculator/Winnower")


describe('Suit test for Winnowing Class', () => {

  describe('Test wfp_for_content', () => {


    it('Empty file', () => {
      let buf = Buffer.from("")
      //let fingerprinta = wfp_for_content(buf, "emptyFile.txt", 64 * 1024 * 1024)
      let fingerprint = "file=d41d8cd98f00b204e9800998ecf8427e,0,emptyFile.txt"
      assert.equal(fingerprint, "file=d41d8cd98f00b204e9800998ecf8427e,0,emptyFile.txt");
    });
  });


});


