import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { BadRequestException, Inject, Injectable } from '@nestjs/common'
import { Cache } from 'cache-manager'
import { generate } from 'otp-generator'
import { config } from '../common/config'
import { exceptions } from '../common/exceptions/exceptions'

@Injectable()
export class OtpService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  getOtpId = (userId: string) => config.security.otpPrefix.concat(userId)

  /**
   * @param id
   * @param length
   * @param expiration in miliseconds
   * @returns otp
   */
  async createOtp(
    userId: string,
    length: number = 6,
    expiration: number = 300000,
  ) {
    const otp = generate(length, {
      digits: true,
      lowerCaseAlphabets: false,
      specialChars: false,
      upperCaseAlphabets: false,
    })

    await this.cacheManager.set(this.getOtpId(userId), otp, expiration)

    return otp
  }

  async verifyOtp(userId: string, otp: string) {
    const storedOtp = await this.cacheManager.get(this.getOtpId(userId))

    if (!storedOtp)
      throw new BadRequestException(exceptions.AUTH.OTP_CODE_EXPIRED)
    if (storedOtp !== otp)
      throw new BadRequestException(exceptions.AUTH.WRONG_OTP_CODE)

    await this.cacheManager.del(this.getOtpId(userId))
  }
}
