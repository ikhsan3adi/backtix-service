import { Injectable, InternalServerErrorException } from '@nestjs/common'
import { $Enums } from '@prisma/client'
import { config } from '../../common/config'
import { PurchaseRepository } from '../purchase.repository'

@Injectable()
export class PurchaseEventService {
  constructor(private purchaseRepository: PurchaseRepository) {
    this.perPage = config.pagination.ticketPerPage
  }

  perPage: number

  async purchasesByEvent(
    eventId: string,
    page: number = 0,
    status: $Enums.PurchaseStatus = 'COMPLETED',
    refundStatus: $Enums.PurchaseRefundStatus = null,
    used: boolean = false,
  ) {
    try {
      return await this.purchaseRepository.findMany({
        where: {
          ticket: { eventId },
          status,
          refundStatus,
          used,
        },
        skip: isNaN(page) ? 0 : page * this.perPage,
        take: this.perPage,
      })
    } catch (e) {
      console.error(e)

      throw new InternalServerErrorException()
    }
  }
}
