import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { BadRequestException, Inject, Injectable } from '@nestjs/common'
import { Cache } from 'cache-manager'
import { generate } from 'otp-generator'
import { config } from '../common/config'
import { exceptions } from '../common/exceptions/exceptions'

@Injectable()
export class OtpService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  getOtpId = (key: string) => config.security.otpPrefix.concat(key)

  /**
   * @param id
   * @param length
   * @param expiration in miliseconds
   * @returns otp
   */
  async createOtp(
    key: string,
    length: number = 6,
    expiration: number = 300000,
  ) {
    const otp = generate(length, {
      digits: true,
      lowerCaseAlphabets: false,
      specialChars: false,
      upperCaseAlphabets: false,
    })

    await this.cacheManager.set(this.getOtpId(key), otp, expiration)

    return otp
  }

  async verifyOtp(key: string, otp: string) {
    const storedOtp = await this.cacheManager.get(this.getOtpId(key))

    if (!storedOtp)
      throw new BadRequestException(exceptions.AUTH.OTP_CODE_EXPIRED)
    if (storedOtp !== otp)
      throw new BadRequestException(exceptions.AUTH.WRONG_OTP_CODE)

    await this.cacheManager.del(this.getOtpId(key))
  }

  async createOtpWithPayload(
    payload: any,
    length: number = 6,
    expiration: number = 300000,
  ) {
    const otp = generate(length, {
      digits: true,
      lowerCaseAlphabets: false,
      specialChars: false,
      upperCaseAlphabets: false,
    })

    await this.cacheManager.set(otp, JSON.stringify(payload), expiration)

    return otp
  }

  async getPayloadFromOtp(otp: string) {
    const payload: string = await this.cacheManager.get(otp)

    if (!payload)
      throw new BadRequestException(exceptions.AUTH.OTP_CODE_EXPIRED)

    return JSON.parse(payload)
  }
}
