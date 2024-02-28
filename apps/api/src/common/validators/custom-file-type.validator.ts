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
    if (!this.validationOptions) return true
    if (this.isFileFields(file)) {
      for (const key in file) {
        if (Object.prototype.hasOwnProperty.call(file, key)) {
          for (const _file of file[key]) {
            if (!_file) continue
            const valid = this.validate(_file)
            if (!valid) return valid
          }
        }
      }
      return true
    }
    return this.validate(file) !== false
  }

  private isFileFields(file: any) {
    for (const key in file) {
      if (Object.prototype.hasOwnProperty.call(file, key)) {
        if (Array.isArray(file[key])) return true
      }
    }
    return false
  }

  private validate(file: Express.Multer.File) {
    const isOctetStream = file.mimetype === 'application/octet-stream'

    let isValidType = !!file.mimetype.match(this.validationOptions.fileType)

    if (isOctetStream) {
      const splitted = file.originalname.split('.')
      isValidType = !!splitted[splitted.length - 1].match(
        this.validationOptions.fileType,
      )
    }

    const isValid = file && 'mimetype' in file && isValidType

    if (!isValid) {
      this.errFile = file
      return isValid
    }
  }
}
