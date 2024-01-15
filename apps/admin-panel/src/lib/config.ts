import { config } from '@backtix-service/config'

export { config }

export const eventImageUrl = `${config.fileStream.baseUrl}${config.fileStream.eventImageUrlPath}/`
export const ticketImageUrl = `${config.fileStream.baseUrl}${config.fileStream.ticketImageUrlPath}/`
export const userImageUrl = (path: string) => {
	if ((path as string).includes('https://')) return path
	return `${config.fileStream.baseUrl}${config.fileStream.userImageUrlPath}/${path}`
}
