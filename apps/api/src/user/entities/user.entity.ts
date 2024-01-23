import { ApiHideProperty, ApiProperty } from '@nestjs/swagger'
import { Exclude, Transform } from 'class-transformer'
import { config } from '../../common/config'
import { getFullFileUrlTransformer } from '../../common/helpers/transformers'
import { Group } from '../enums/group.enum'

export class UserEntity {
  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial)
  }

  @ApiHideProperty()
  @Exclude()
  password: string

  provider: string

  id: string
  username: string
  fullname: string
  email: string

  location: string
  latitude: number
  longitude: number
  locationGeography: any

  @Transform(getFullFileUrlTransformer(config.fileStream.userImageUrlPath))
  image: string

  @ApiProperty({
    enum: [
      Group.USER.valueOf(),
      Group.ADMIN.valueOf(),
      Group.SUPERADMIN.valueOf(),
    ],
    isArray: true,
  })
  groups: Group[] | string[]

  activated: boolean
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date

  balance: { balance: number; revenue: number }
}
