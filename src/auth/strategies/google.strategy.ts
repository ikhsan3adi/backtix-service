import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { Strategy, VerifyCallback } from 'passport-google-oauth2'
import { config } from '../../common/config'
import { UserEntity } from '../../user/entities/user.entity'

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor() {
    super({
      clientID: config.security.google.clientID,
      clientSecret: config.security.google.clientSecret,
      callbackURL: config.security.google.callbackURL,
      scope: ['profile', 'email'],
    })
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, name, displayName, emails, picture } = profile

    const user = new UserEntity({
      id,
      fullname: `${name.givenName} ${name.familyName}`,
      email: emails[0].value,
      username: `${displayName.split(' ').join('').toLowerCase()}-${id}`,
    })

    done(null, user)
  }
}
