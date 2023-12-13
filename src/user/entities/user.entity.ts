import { Exclude } from 'class-transformer'
import { Group } from '../enums/group.enum'
import { ApiHideProperty } from '@nestjs/swagger'

export class UserEntity {
  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial)
  }

  @ApiHideProperty()
  @Exclude()
  password: string

  id: string
  username: string
  fullname: string
  email: string
  groups: Group[] | string[]
  activated: boolean
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date
}
