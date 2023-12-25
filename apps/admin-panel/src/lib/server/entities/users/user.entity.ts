import { Group } from './group.enum'

export class UserEntity {
	constructor(partial: Partial<UserEntity>) {
		Object.assign(this, partial)
	}

	provider: string

	id: string
	username: string
	fullname: string
	email: string

	image: string

	groups: Group[] | string[]

	activated: boolean
	createdAt: Date
	updatedAt: Date
	deletedAt?: Date

	balance?: { balance: number; revenue: number }
}
