import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common'
import { UserService } from '../user/user.service'
import { CreateUserDto } from '../user/dto/create-user.dto'
import { JwtService } from '@nestjs/jwt'
import { config } from '../common/config'
import { PasswordService } from './password.service'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Cache } from 'cache-manager'
import { UserEntity } from '../user/entities/user.entity'
import { MailService } from '../mail/mail.service'
import { OtpService } from './otp.service'

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
      throw new NotFoundException('User not found')
    }

    const passwordValid = await this.passwordService.validatePassword(
      password,
      user.password,
    )

    if (!passwordValid) {
      throw new UnauthorizedException('Wrong password')
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
      throw new UnauthorizedException('Refresh token cannot be empty')
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
      throw new UnauthorizedException('Invalid/Expired token')
    }

    const user = await this.userService.findUniqueBy({ id: payload.sub })
    if (!user) {
      throw new NotFoundException('User not found')
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
    if (user.activated) throw new BadRequestException('ACTIVATED')

    const otp = await this.otpService.createOtp(user.id)
    // console.log(otp)
    await this.mailService.sendUserActivation(user, otp)

    return { message: 'Activation code sent' }
  }

  async activateUser(user: UserEntity, otp: string) {
    await this.otpService.verifyOtp(user.id, otp)

    return await this.userService.activate(user.id)
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
