export class UserEntity {
	constructor(partial: Partial<UserEntity>) {
		Object.assign(this, partial)
	}

	provider: string

	id: string
	username: string
	fullname: string
	email: string
	location: string

	image: string

	groups: ('USER' | 'ADMIN' | 'SUPERADMIN')[]

	activated: boolean
	createdAt: Date
	updatedAt: Date
	deletedAt?: Date

	balance?: { balance: number; revenue: number }
}
