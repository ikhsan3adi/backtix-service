import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common'
import { UserService } from '../user/user.service'
import { RegisterUserDto } from './dto/register-user.dto'
import { JwtService } from '@nestjs/jwt'
import { config } from '../common/config'
import { PasswordService } from './password.service'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Cache } from 'cache-manager'

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private passwordService: PasswordService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async registerUser(registerUserDto: RegisterUserDto) {
    const userAvailable = await this.userService.find({
      where: {
        OR: [
          { email: registerUserDto.email },
          { username: registerUserDto.username },
        ],
      },
      select: { email: true, username: true },
    })

    if (userAvailable?.email === registerUserDto.email) {
      throw new ConflictException(
        `Email ${registerUserDto.email} already registered`,
      )
    } else if (userAvailable?.username === registerUserDto.username) {
      throw new ConflictException(
        `Username ${registerUserDto.username} already registered`,
      )
    }

    const hashedPassword = await this.passwordService.hashPassword(
      registerUserDto.password,
    )
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...user } = await this.userService.create({
      ...registerUserDto,
      password: hashedPassword,
    })
    return user
  }

  async validateUser(username: string, password: string) {
    const user = await this.userService.findUnique({ where: { username } })

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

  async login(user: any) {
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

    const user = await this.userService.findUnique({
      where: { id: payload.sub },
    })
    if (!user) {
      throw new NotFoundException('User not found')
    }
    return user
  }

  async refreshAuth(user: any) {
    const payload = { sub: user.id, username: user.username, email: user.email }

    return {
      accessToken: this.jwtService.sign(payload, {
        secret: config.security.accessTokenKey,
        expiresIn: config.security.accessTokenExpiration,
      }),
    }
  }

  async logout(token: string) {
    await this.cacheManager.del(token)
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
