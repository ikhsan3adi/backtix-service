export abstract class StorageService {
  abstract checkIfFileOrDirectoryExists(path: string): boolean
  abstract getFile(path: string, encoding?: string): Promise<string | Buffer>
  abstract generateRandomFilename(filename: string): Promise<string> | string
  abstract createFile(
    path: string,
    filename: string,
    data: string | Buffer,
  ): Promise<void> | void
  abstract deleteFile(path: string, filename?: string): void
}
