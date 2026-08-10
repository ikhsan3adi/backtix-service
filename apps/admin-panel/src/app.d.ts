import type { UserEntity } from '$lib/server/entities/users/user.entity'
import { PrismaClient } from '@prisma/client'

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			user: UserEntity
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
	var prisma: PrismaClient
}

export {}
