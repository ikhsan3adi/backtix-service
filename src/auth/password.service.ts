import { Injectable } from '@nestjs/common'
import { hash, compare } from 'bcrypt'
import { config } from '../common/config'

@Injectable()
export class PasswordService {
  get bcryptSaltRounds(): string | number {
    const saltOrRounds = config.security.bcryptSaltOrRound

    return Number.isInteger(Number(saltOrRounds))
      ? Number(saltOrRounds)
      : saltOrRounds
  }

  validatePassword(password: string, hashedPassword: string): Promise<boolean> {
    return compare(password, hashedPassword)
  }

  hashPassword(password: string): Promise<string> {
    return hash(password, this.bcryptSaltRounds)
  }
}
