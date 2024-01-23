import { PartialType } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsLatitude, IsLongitude, IsNotEmpty, IsString } from 'class-validator'
import { CreateUserDto } from './create-user.dto'

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsString()
  @IsNotEmpty()
  location: string

  @IsLatitude()
  @Type(() => Number)
  latitude: number

  @IsLongitude()
  @Type(() => Number)
  longitude: number
}
