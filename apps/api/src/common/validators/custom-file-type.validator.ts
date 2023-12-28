import { FileTypeValidator } from '@nestjs/common'

export class CustomFileTypeValidator extends FileTypeValidator {
  private errFile: Express.Multer.File

  buildErrorMessage() {
    if (!this.errFile) {
      return super.buildErrorMessage()
    }
    return `Validation failed on file '${this.errFile.originalname}' (expected type is ${this.validationOptions.fileType})`
  }

  isValid(file: any) {
    if (!this.isFileFields(file)) return super.isValid(file)
    if (!this.validationOptions) return true

    for (const key in file) {
      if (Object.prototype.hasOwnProperty.call(file, key)) {
        for (const _file of file[key]) {
          if (!_file) continue

          const isValid =
            !!_file &&
            'mimetype' in _file &&
            !!_file.mimetype.match(this.validationOptions.fileType)

          if (!isValid) {
            this.errFile = _file
            return isValid
          }
        }
      }
    }
    return true
  }

  private isFileFields(file: any) {
    for (const key in file) {
      if (Object.prototype.hasOwnProperty.call(file, key)) {
        if (Array.isArray(file[key])) return true
      }
    }
    return false
  }
}