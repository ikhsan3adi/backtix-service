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
      })
    } catch (e) {
      console.error(e)

      throw new InternalServerErrorException()
    }
  }
}
