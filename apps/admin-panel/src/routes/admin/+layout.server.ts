import { config } from '$lib/config'
import type { LayoutServerLoad } from './$types'

export const load = (async ({ url }) => {
	return { links: { openApi: `${config.server.baseUrl}api/docs` }, activeUrl: url.pathname }
}) satisfies LayoutServerLoad
