import { Group } from '../enums/group.enum'

export class UpdateUserDto {
  id?: string
  username: string
  fullname: string
  email: string
  password: string
  activated?: boolean
  groups?: Group[]
  balance?: number
}
