import { Transport } from "./Transport";

export class ScanossLogger implements Transport {
  private colors = {
    error: '\x1b[31m',   // Red
    warn: '\x1b[33m',    // Yellow
    info: '\x1b[36m',    // Cyan
    log: '\x1b[32m',     // Green
    debug: '\x1b[90m',   // Gray
    reset: '\x1b[0m'     // Reset
  };

  private timeStamp(): string {
    const date = new Date();
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  }


  public error(msg: string): void {
    console.error(`${this.colors.error} ${this.timeStamp()} > [ ERROR ]:${this.colors.reset} ${msg}`);
  }

  public info(msg: string): void {
    console.info(`${this.colors.info} ${this.timeStamp()} > [ INFO ]:${this.colors.reset} ${msg}`);
  }

  public log(msg: string): void {
    console.info(`${this.colors.info} ${this.timeStamp()} > [ INFO ]:${this.colors.reset} ${msg}`);
  }

  public warn(msg: string): void {
    console.warn(`${this.colors.warn} ${this.timeStamp()} > [ WARN ]:${this.colors.reset} ${msg}`);
  }
}
