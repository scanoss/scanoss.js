export declare class Logger {
    private level;
    private transport;
    constructor();
    setTransport(transport: Logger.TransportType): void;
    setLevel(level?: Logger.Level): void;
    log(msg: string, level?: Logger.Level): void;
}
export declare namespace Logger {
    type TransportType = (msg: string) => void;
    enum Level {
        error = 0,
        warn = 1,
        info = 2,
        verbose = 3,
        debug = 4
    }
}
export declare const logger: Logger;
