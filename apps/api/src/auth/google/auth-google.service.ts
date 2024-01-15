import { Injectable, InternalServerErrorException } from '@nestjs/common'
import { OAuth2Client } from 'google-auth-library'
import { config } from '../../common/config'
import { UserEntity } from '../../user/entities/user.entity'

@Injectable()
export class AuthGoogleService {
  private oAuthClient: OAuth2Client

  constructor() {
    this.oAuthClient = new OAuth2Client({
      clientId: config.security.google.clientID,
      clientSecret: config.security.google.clientSecret,
    })
  }

  async getUserByIdToken(idToken: string) {
    try {
      const ticket = await this.oAuthClient.verifyIdToken({
        idToken,
      })

      const { sub: id, name, email, picture } = ticket.getPayload()

      return new UserEntity({
        provider: 'google',
        id,
        username: `${name.split(' ').join('').toLowerCase()}-${id}`,
        email,
        fullname: name,
        image: picture,
      })
    } catch (e) {
      console.error(e)

      throw new InternalServerErrorException()
    }
  }
}
