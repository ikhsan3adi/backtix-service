export abstract class StorageService {
  abstract checkIfFileOrDirectoryExists(path: string): boolean
  abstract getFile(path: string, encoding?: string): Promise<string | Buffer>
  abstract createFile(
    path: string,
    filename: string,
    data: string | Buffer,
  ): Promise<string>
  abstract deleteFile(path: string): void
}
