import { IWfpProviderInput, WfpProvider } from "../WfpProvider";
import fs from "fs";

export class WfpSplitter extends WfpProvider {



  public start(params: IWfpProviderInput): void {

    const wfpPath = params.wfpPath;
    if (!wfpPath) this.sendError('WFP path is not defined');

    const wfpStream = fs.createReadStream(wfpPath, { encoding: 'utf8' });


  }
  public stop(): void {
    throw new Error("Method not implemented.");
  }
  public pause(): void {
    throw new Error("Method not implemented.");
  }
  public resume(): void {
    throw new Error("Method not implemented.");
  }





}
