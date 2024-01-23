import { eventImageUrl, ticketImageUrl, userImageUrl } from '$lib/config'
import { redirect } from '@sveltejs/kit'
import type { Actions, PageServerLoad } from './$types'

export const load = (async ({ params }) => {
	const event = await prisma.event.findUnique({
		where: { id: params.id },
		include: {
			images: true,
			user: true,
			tickets: {
				include: {
					_count: {
						select: {
							purchases: { where: { status: 'COMPLETED' } }
						}
					}
				}
			}
		}
	})

	const images = event?.images.map((e) => ({
		alt: e.description,
		src: eventImageUrl.concat(e.image),
		title: e.image
	}))

	const tickets = event?.tickets.map((e) => ({
		...e,
		src: ticketImageUrl.concat(e.image)
	}))

	const ticketPurchases = await prisma.purchase.findMany({
		where: { ticket: { eventId: params.id } },
		include: {
			user: { select: { username: true } },
			ticket: { select: { name: true } }
		}
	})

	const userImage = event?.user.image ? userImageUrl(event?.user.image) : undefined

	return { event, images, tickets, userImage, ticketPurchases }
}) satisfies PageServerLoad

export const actions: Actions = {
	approve: async ({ request }) => {
		const { id } = Object.fromEntries(await request.formData()) as {
			id: string
		}

		await prisma.event.update({
			where: { id },
			data: { status: 'PUBLISHED' }
		})

		redirect(303, '/admin/event?status=PUBLISHED')
	},

	reject: async ({ request }) => {
		const { id } = Object.fromEntries(await request.formData()) as {
			id: string
		}

		await prisma.event.update({
			where: { id },
			data: { status: 'REJECTED' }
		})

		redirect(303, '/admin/event?status=REJECTED')
	}
}
