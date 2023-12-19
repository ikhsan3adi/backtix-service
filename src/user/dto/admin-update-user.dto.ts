import { ApiProperty, PartialType } from '@nestjs/swagger'
import { Group } from '../enums/group.enum'
import { UpdateUserDto } from './update-user.dto'
import { IsBooleanString, IsNumber, IsString } from 'class-validator'

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
}
