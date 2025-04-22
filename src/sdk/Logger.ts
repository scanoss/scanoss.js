
export class Logger {
  private level: Logger.Level;
  private transport: Logger.TransportType;
  private debug: boolean;

  constructor() {
    this.setLevel(Logger.Level.info);
    this.setTransport((msg: string) => {console.log(msg)});
    this.debug = false;
  }

  public setTransport(transport: Logger.TransportType) {
    this.transport = transport;
  }

  public setLevel(level = Logger.Level.info) {
    this.level = level;
  }

  public enableDebug(enabled: boolean) {
    this.debug = enabled;
  }

  public log(msg: string, level = Logger.Level.info) {
    if (this.debug) {
      this.transport(msg);
    }
  }

}

export namespace Logger {
  export type TransportType = (msg: string) => void;

  export enum Level {
    error,
    warn,
    info,
    verbose,
    debug
  }
}

export const logger = new Logger();



