import { UserEntity } from '../../user/entities/user.entity'

export class WithdrawRequestEntity {
  constructor(partial: Partial<WithdrawRequestEntity>) {
    Object.assign(this, partial)
  }

  id: string
  amount: number
  method: string
  details: string
  status: string
  createdAt: Date
  updatedAt: Date

  user: Partial<UserEntity>
}
