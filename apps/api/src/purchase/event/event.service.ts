import { Injectable, InternalServerErrorException } from '@nestjs/common'
import { config } from '../../common/config'
import { PurchaseRepository } from '../purchase.repository'

@Injectable()
export class PurchaseEventService {
  constructor(private purchaseRepository: PurchaseRepository) {
    this.perPage = config.pagination.ticketPerPage
  }

  purchaseStatuses = ['PENDING', 'COMPLETED', 'CANCELLED']
  refundStatuses = ['REFUNDING', 'REFUNDED', 'DENIED']
  perPage: number

  async purchasesByEvent(
    eventId: string,
    page: number = 0,
    status: 'PENDING' | 'COMPLETED' | 'CANCELLED' = 'COMPLETED',
    refundStatus: 'REFUNDING' | 'REFUNDED' | 'DENIED' = null,
    used: boolean = false,
  ) {
    const s = this.purchaseStatuses.includes(status) ? status : undefined
    const rs = this.refundStatuses.includes(refundStatus)
      ? refundStatus
      : undefined

    try {
      return await this.purchaseRepository.findMany({
        where: {
          ticket: { eventId },
          status: s,
          refundStatus: rs,
          used,
        },
        include: { user: true, ticket: true },
        skip: isNaN(page) ? 0 : page * this.perPage,
        take: this.perPage,
      })
    } catch (e) {
      console.error(e)

      throw new InternalServerErrorException()
    }
  }
}
