import { CACHE_MANAGER } from '@nestjs/cache-manager'
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Cache } from 'cache-manager'
import { config } from '../common/config'
import { exceptions } from '../common/exceptions/exceptions'
import { MailService } from '../mail/mail.service'
import { CreateUserDto } from '../user/dto/create-user.dto'
import { UserEntity } from '../user/entities/user.entity'
import { Group } from '../user/enums/group.enum'
import { UserService } from '../user/user.service'
import { OtpService } from './otp.service'
import { PasswordService } from './password.service'

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private passwordService: PasswordService,
    private mailService: MailService,
    private otpService: OtpService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async googleSignInOrSignUp(user: UserEntity) {
    try {
      await this.userService.checkEmailUsername({
        email: user.email,
        username: undefined,
      })

      return {
        ...(await this.registerUser({ ...user, password: user.id })),
        new: true,
      }
    } catch (e) {
      if (e instanceof ConflictException) {
        const _user = await this.userService.findUniqueBy({ email: user.email })
        return {
          ...(await this.login({
            ...user,
            id: _user.id,
            username: _user.username,
          })),
          new: false,
        }
      }
      console.error(e)
      throw new InternalServerErrorException()
    }
  }

  async registerUser(createUserDto: CreateUserDto) {
    await this.userService.checkEmailUsername(createUserDto)

    const hashedPassword = await this.passwordService.hashPassword(
      createUserDto.password,
    )

    return await this.userService.create({
      ...createUserDto,
      password: hashedPassword,
    })
  }

  async validateUser(username: string, password: string) {
    const user = await this.userService.findUniqueBy({ username })

    if (!user) {
      throw new NotFoundException(exceptions.USER.NOT_FOUND)
    }

    const passwordValid = await this.passwordService.validatePassword(
      password,
      user.password,
    )

    if (!passwordValid) {
      throw new UnauthorizedException(exceptions.AUTH.WRONG_PASSWORD)
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...result } = user
    return result
  }

  async login(user: UserEntity) {
    const payload = { sub: user.id, username: user.username, email: user.email }

    const refreshToken = this.generateRefreshToken(payload)

    // Save refresh token to cache
    await this.cacheManager.set(
      refreshToken,
      user.id,
      config.security.refreshTokenTTL,
    )

    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken,
    }
  }

  async validateRefreshToken(token: string) {
    if (!token) {
      throw new UnauthorizedException(exceptions.AUTH.EMPTY_REFRESH_TOKEN)
    }

    let payload: any
    try {
      const authenticated = await this.cacheManager.get(token) // Get user id using token
      if (!authenticated) throw new Error()

      payload = await this.jwtService.verifyAsync(token, {
        secret: config.security.refreshTokenKey,
      })
      if (payload.sub !== authenticated) throw new Error()
    } catch {
      throw new UnauthorizedException(exceptions.AUTH.INVALID_TOKEN)
    }

    const user = await this.userService.findUniqueBy({ id: payload.sub })
    if (!user) {
      throw new NotFoundException(exceptions.USER.NOT_FOUND)
    }
    return user
  }

  async refreshAuth(user: UserEntity) {
    const payload = { sub: user.id, username: user.username, email: user.email }

    return { accessToken: this.generateAccessToken(payload) }
  }

  async logout(token: string) {
    await this.cacheManager.del(token)
  }

  async requestActivation(user: UserEntity) {
    if (user.activated) throw new BadRequestException(exceptions.AUTH.ACTIVATED)

    const otp = await this.otpService.createOtp(user.id)

    try {
      await this.mailService.sendUserActivation(user, otp)
    } catch (e) {
      console.error(e)
      throw new InternalServerErrorException(exceptions.MAIL.SENDING_FAILED)
    } finally {
      return { message: 'Activation code sent' }
    }
  }

  async activateUser(user: UserEntity, otp: string) {
    await this.otpService.verifyOtp(user.id, otp)

    return await this.userService.activate(user.id)
  }

  async requestAdminEmailSignIn(email: string) {
    if (!email) throw new BadRequestException()
    const user = await this.userService.findUniqueBy({ email })

    if (!user) throw new NotFoundException(exceptions.USER.NOT_FOUND)

    if (!user.groups.some((v) => v.includes(Group.ADMIN))) {
      throw new ForbiddenException()
    }

    const otp = await this.otpService.createOtpWithPayload(user)
    console.log(otp)

    try {
      await this.mailService.sendAdminSignInCode(new UserEntity(user), otp)
    } catch (e) {
      console.error(e)
      throw new InternalServerErrorException(exceptions.MAIL.SENDING_FAILED)
    } finally {
      return { message: 'OTP code sent' }
    }
  }

  async adminOtpSignIn(otp: string) {
    if (!otp) throw new BadRequestException()
    const user = new UserEntity(await this.otpService.getPayloadFromOtp(otp))

    return await this.login(user)
  }

  private generateAccessToken(payload: any) {
    return this.jwtService.sign(payload, {
      secret: config.security.accessTokenKey,
      expiresIn: config.security.accessTokenExpiration,
    })
  }

  private generateRefreshToken(payload: any) {
    return this.jwtService.sign(payload, {
      secret: config.security.refreshTokenKey,
      expiresIn: config.security.refreshTokenExpiration,
    })
  }
}
