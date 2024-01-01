import { config } from '@backtix-service/config'

export { config }

export const eventImageUrl = `${config.fileStream.baseUrl}${config.fileStream.eventImageUrlPath}/`
export const ticketImageUrl = `${config.fileStream.baseUrl}${config.fileStream.ticketImageUrlPath}/`
export const userImageUrl = `${config.fileStream.baseUrl}${config.fileStream.userImageUrlPath}/`
