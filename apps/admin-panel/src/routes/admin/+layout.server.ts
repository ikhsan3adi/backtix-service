import { config, userImageUrl } from '$lib/config'
import type { LayoutServerLoad } from './$types'

export const load = (async ({ url, locals }) => {
	return {
		links: { openApi: `${config.server.baseUrl}api/docs` },
		activeUrl: url.pathname,
		my: {
			...locals.user,
			image: locals.user.image ? userImageUrl(locals.user.image) : undefined
		}
	}
}) satisfies LayoutServerLoad
