import {WfpCalculator} from '../src/lib/scanner/WfpProvider/WfpCalculator/WfpCalculator';
import { IWfpProviderInput } from '../src/lib/scanner/WfpProvider/WfpProvider';
import {ScannerEvents, WinnowingMode} from '../src/lib/scanner/ScannerTypes'
import {
  FingerprintPackage
} from '../src/lib/scanner/WfpProvider/FingerprintPackage';



describe('Suit test for WfpCalculator Class', () => {

  describe('Test Winnowings Modes', function () {

    let wfpInput: IWfpProviderInput;
    let wfpCalculator: WfpCalculator;

    beforeEach(function() {
      wfpCalculator = new WfpCalculator();
      wfpCalculator.init();
    });

    it('Winnowing Full mode', function (done) {
      wfpInput  = {
        fileList: [__dirname + "/data/scanner/file1.c"],
        folderRoot: __dirname + "/data/scanner/"
      };

      let wfpExpected = `file=736c0a4b4440e35baffc9378304ee588,907,file1.c
8=c0e39912
9=61eee030
11=eff88a55
16=9d9c5251,c8ca7af5
21=520ee8e5
26=1f2fa230,2e83cf84,57d0c3d2
28=4a9386b1
31=fbf8548e,b6002136
36=5622280b
39=8503d2f9
40=0b62ff71
`

      wfpCalculator.on(ScannerEvents.WINNOWING_FINISHED, () => {
        done()
      });

      wfpCalculator.on(ScannerEvents.ERROR, (err) => {
        done(err)
      })

      wfpInput.winnowingMode=WinnowingMode.FULL_WINNOWING,
        wfpCalculator.start(wfpInput)
    });


    it('Winnowing HPSM mode', function (done) {

      wfpInput  = {
        fileList: [__dirname + "/data/scanner/file1.c"],
        folderRoot: __dirname + "/data/scanner/"
      };

      let wfpExpected = `file=736c0a4b4440e35baffc9378304ee588,907,file1.c
hpsm=91ffe7ff989bffe7fcff91bdff2dff3d00a400ff9b00a400ffb6004c42ff9c004200ffc700ff62408b
8=c0e39912
9=61eee030
11=eff88a55
16=9d9c5251,c8ca7af5
21=520ee8e5
26=1f2fa230,2e83cf84,57d0c3d2
28=4a9386b1
31=fbf8548e,b6002136
36=5622280b
39=8503d2f9
40=0b62ff71
`

      let wfpResponse: FingerprintPackage;
      wfpCalculator.on(ScannerEvents.WINNOWING_NEW_CONTENT, (c: FingerprintPackage) => {
        wfpResponse = c;
      });

      wfpCalculator.on(ScannerEvents.WINNOWING_FINISHED, () => {
        if (wfpResponse.getContent() === wfpExpected) {
          done()
        } else {
          done(new Error("Diferences in wfp generated and expected"))
        }
      });

      wfpCalculator.on(ScannerEvents.ERROR, (err) => {
        done(err)
      })

      wfpInput.winnowingMode=WinnowingMode.FULL_WINNOWING_HPSM;
      wfpCalculator.start(wfpInput)
    });


  });

});


