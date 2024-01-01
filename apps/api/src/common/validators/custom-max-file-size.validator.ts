import { MaxFileSizeValidator } from '@nestjs/common'

export class CustomMaxFileSizeValidator extends MaxFileSizeValidator {
  private errFile: Express.Multer.File

  buildErrorMessage() {
    if (!this.errFile) {
      return super.buildErrorMessage()
    }
    return `Validation failed on file '${this.errFile.originalname}' (expected size is less than ${this.validationOptions.maxSize})`
  }

  isValid(file: any) {
    if (!this.isFileFields(file)) return super.isValid(file)
    if (!this.validationOptions) return true

    for (const key in file) {
      if (Object.prototype.hasOwnProperty.call(file, key)) {
        for (const _file of file[key]) {
          if (!_file) continue
          const isValid =
            'size' in _file && _file.size < this.validationOptions.maxSize

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
