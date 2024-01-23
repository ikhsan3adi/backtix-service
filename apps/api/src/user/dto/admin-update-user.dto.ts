import { ApiProperty, PartialType } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
  IsBooleanString,
  IsLatitude,
  IsLongitude,
  IsNumber,
  IsString,
} from 'class-validator'
import { Group } from '../enums/group.enum'
import { UpdateUserDto } from './update-user.dto'

export class AdminUpdateUserDto extends PartialType(UpdateUserDto) {
  @IsString()
  id?: string

  @IsString()
  username: string

  @IsString()
  fullname: string

  @IsString()
  email: string

  @IsString()
  password: string

  @IsBooleanString()
  activated?: boolean

  @ApiProperty({
    enum: [
      Group.USER.valueOf(),
      Group.ADMIN.valueOf(),
      Group.SUPERADMIN.valueOf(),
    ],
    isArray: true,
  })
  groups?: Group[]

  @IsNumber()
  balance?: number

  @IsNumber()
  revenue?: number

  @IsString()
  location: string

  @IsLatitude()
  @Type(() => Number)
  latitude: number

  @IsLongitude()
  @Type(() => Number)
  longitude: number
}
