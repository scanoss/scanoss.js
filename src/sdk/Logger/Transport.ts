export interface Transport {
  info(msg: string): void;
  error(msg: string): void;
  warn(msg: string): void;
  log(msg: string): void;
}
