import type { PageLoad, PageLoadEvent } from './$types'

export const load = (async (event: PageLoadEvent) => {
	return { email: event.url.searchParams.get('email') }
}) satisfies PageLoad
