declare module 'libarchive.js/dist/libarchive-node.mjs' {
  export class Archive {
    static open(file: any): Promise<Archive>;
    extractFiles(): Promise<Record<string, any>>;
    close(): Promise<void>;
  }
}
