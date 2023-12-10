import { Group } from '../enums/group.enum'

export class UserEntity {
  id: string
  username: string
  email: string
  groups: Group[]
  activated: boolean
}
