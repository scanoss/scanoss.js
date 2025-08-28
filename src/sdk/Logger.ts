
export class Logger {
  private level: Logger.Level;
  private transport: Logger.TransportType;

  constructor() {
    this.setLevel(Logger.Level.info);
    this.setTransport((msg: string) => {console.log(msg)});
  }

  public setTransport(transport: Logger.TransportType) {
    this.transport = transport;
  }

  public setLevel(level = Logger.Level.info) {
    this.level = level;
  }

  public log(msg: string, level = Logger.Level.info) {
    if (this.level <= level) {
      this.transport(msg);
    }
  }

  public debug(msg: string) {
    if (Logger.Level.debug <= this.level) {
      this.transport(msg);
    }
  }

  public error(msg: string) {
    if (Logger.Level.error <= this.level) {
      this.transport(msg);
    }
  }

  public warn(msg: string) {
    if (Logger.Level.warn <= this.level) {
      this.transport(msg);
    }
  }

  public info(msg: string) {
    if (Logger.Level.info <= this.level) {
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



