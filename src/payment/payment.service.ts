import { Injectable, InternalServerErrorException } from '@nestjs/common'
import { config } from '../common/config'
import { Transaction } from './interfaces/transaction.interface'

@Injectable()
export class PaymentService {
  async createTransaction(transaction: Transaction): Promise<{
    token?: string
    redirect_url?: string
    error_messages?: string[]
  }> {
    const url = config.payment.url
    const options = {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        authorization: `Basic ${Buffer.from(config.payment.authString).toString(
          'base64',
        )}`,
      },
      body: JSON.stringify(transaction),
    }

    try {
      return await fetch(url, options).then(async (res) => {
        const json = await res.json()
        // console.log(json)
        return json
      })
    } catch (e) {
      console.error(e)
      throw new InternalServerErrorException(e)
    }
  }
}

// {
//   transaction_details: {
//     order_id: 'order-id',
//     gross_amount: 10000,
//   },
//   credit_card: { secure: true },
//   item_details: [
//     {
//       id: 'ticket_id',
//       price: 10000,
//       quantity: 1,
//       name: 'Ticket + Event name',
//       merchant_name: 'username of event owner',
//     },
//   ],
//   customer_details: {
//     first_name: 'User name',
//     last_name: 'User name',
//     email: 'test@midtrans.com',
//   },
// }
