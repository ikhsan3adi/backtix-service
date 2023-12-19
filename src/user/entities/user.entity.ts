import { Exclude, Transform } from 'class-transformer'
import { Group } from '../enums/group.enum'
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger'
import { getFullFileUrlTransformer } from '../../common/helpers/transformers'
import { config } from '../../common/config'

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

  balance: { balance: number }
}
