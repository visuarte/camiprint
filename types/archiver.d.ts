declare module 'archiver' {
  import { Transform } from 'stream'
  interface ArchiverOptions { zlib?: { level?: number }; store?: boolean }
  interface Archiver extends Transform {
    append(input: any, name: string): Archiver
    file(path: string, options?: any): Archiver
    directory(dir: string, dest?: string): Archiver
    finalize(): Promise<void>
    pipe<T extends NodeJS.WritableStream>(destination: T): T
  }
  function archiver(format: string, options?: ArchiverOptions): Archiver
  export default archiver
}
