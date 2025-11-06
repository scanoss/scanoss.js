import { Transport } from "./Transport";
import { ScanossLogger } from "./ScanossLogger";

export class Logger {
  private level: Logger.Level;
  private transport: Transport;

  constructor(level: Logger.Level = Logger.Level.info, transport: Transport = new ScanossLogger()) {
    this.setLevel(level);
    this.setTransport(transport);
  }

  public setTransport(transport: Transport) {
    this.transport = transport;
  }

  public setLevel(level = Logger.Level.info) {
    this.level = level;
  }

  public log(msg: string, level = Logger.Level.info) {
    if (this.level <= level) {
      this.transport.log(msg);
    }
  }

  public debug(msg: string) {
    if (Logger.Level.debug <= this.level) {
      this.transport.log(msg);
    }
  }

  public error(msg: string) {
    if (Logger.Level.error <= this.level) {
      this.transport.error(msg);
    }
  }

  public warn(msg: string) {
    if (Logger.Level.warn <= this.level) {
      this.transport.warn(msg);
    }
  }

  public info(msg: string) {
    if (Logger.Level.info <= this.level) {
      this.transport.info(msg);
    }
  }
}

export namespace Logger {
  export type TransportType = (msg: string, level: Level) => void;

  export enum Level {
    error,
    warn,
    info,
    verbose,
    debug
  }
}

export const logger = new Logger();
