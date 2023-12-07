import { ExtractJwt, Strategy } from 'passport-jwt'
import { PassportStrategy } from '@nestjs/passport'
import { Injectable } from '@nestjs/common'
import { config } from '../../common/config'
import { UserService } from '../../user/user.service'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.security.accessTokenKey,
    })
  }

  async validate(payload: any) {
    return await this.userService.findUnique({
      where: {
        id: payload.sub,
        username: payload.username,
        email: payload.email,
      },
    })
  }
}
