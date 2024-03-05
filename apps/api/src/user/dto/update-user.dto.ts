import { OmitType } from '@nestjs/swagger'
import { Transform, Type } from 'class-transformer'
import {
  IsBoolean,
  IsLatitude,
  IsLongitude,
  IsNotEmpty,
  IsString,
} from 'class-validator'
import { CreateUserDto } from './create-user.dto'

export class UpdateUserDto extends OmitType(CreateUserDto, ['password']) {
  @IsString()
  @IsNotEmpty()
  location: string

  @IsLatitude()
  @Type(() => Number)
  latitude: number

  @IsLongitude()
  @Type(() => Number)
  longitude: number

  @IsBoolean()
  @Transform(({ value }: { value: string }) => value === 'true')
  deleteImage?: boolean = false
}
