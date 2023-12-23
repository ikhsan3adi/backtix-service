import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Request } from 'express'
import { AuthService } from '../auth.service'

@Injectable()
export class RefreshAuthGuard implements CanActivate {
  constructor(private authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest()
    const token: string = request.body.refreshToken

    const user = await this.authService.validateRefreshToken(token)

    request.user = user

    return true
  }
}
