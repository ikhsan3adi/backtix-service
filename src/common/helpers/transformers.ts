import { BadRequestException } from '@nestjs/common'
import {
  ClassConstructor,
  TransformFnParams,
  plainToInstance,
} from 'class-transformer'
import { config } from '../config'

/**
 * Transform string object to instance / plain
 *
 * Support string object array
 *
 * @param cls instance type
 */
export const objectStringTransformer =
  (cls?: ClassConstructor<any>) => (options: TransformFnParams) => {
    try {
      const tryParse = (value: any) => {
        return typeof value === 'string' ? JSON.parse(value) : value
      }

      if (!Array.isArray(options.value)) {
        return tryParse(options.value)
      }

      const values: (typeof cls)[] = []
      for (const value of options.value) {
        values.push(
          cls ? plainToInstance(cls, tryParse(value)) : tryParse(value),
        )
      }

      return values
    } catch (e) {
      throw new BadRequestException(`${options.key} contains invalid JSON`)
    }
  }

/**
 * Transform datetime string to iso format
 * @returns string
 */
export const dateTimeTransformer = (options: TransformFnParams) => {
  try {
    return new Date(options.value).toISOString()
  } catch (e) {
    throw new BadRequestException(`${options.key} contains invalid DateTime`)
  }
}

/**
 * @param path extra path: `baseUrl/file/[path]`
 * @returns string
 */
export const getFullFileUrlTransformer =
  (path?: string) => (options: TransformFnParams) => {
    if (!options.value) return null
    return path
      ? `${config.fileStream.baseUrl}${path}/${options.value}`
      : `${config.fileStream.baseUrl}${options.value}`
  }
