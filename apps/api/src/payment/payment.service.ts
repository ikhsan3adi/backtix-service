import { Injectable, InternalServerErrorException } from '@nestjs/common'
import { config } from '../common/config'
import { Transaction } from './interfaces/transaction.interface'

@Injectable()
export class PaymentService {
  constructor() {
    this.#authString = Buffer.from(config.payment.authString).toString('base64')
  }

  #authString: string

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
        authorization: `Basic ${this.#authString}`,
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
