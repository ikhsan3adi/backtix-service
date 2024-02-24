import { CustomFileTypeValidator } from '../validators/custom-file-type.validator'
import { CustomMaxFileSizeValidator } from '../validators/custom-max-file-size.validator'

export const imageValidators = [
  new CustomMaxFileSizeValidator({ maxSize: 5000000 }),
  new CustomFileTypeValidator({ fileType: /^.*(png|jpeg|jpg|webp)$/gi }),
]
