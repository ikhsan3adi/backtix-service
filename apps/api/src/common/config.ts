import { config as conf } from '@backtix-service/config'

export const config = {
  ...conf,
  pagination: {
    eventPerPage: 20,
    ticketPerPage: 20,
  },
}
