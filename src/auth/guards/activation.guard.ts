import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { UserEntity } from '../../user/entities/user.entity'
import { ALLOW_UNACTIVATED_KEY } from '../decorators/allow-unactivated.decorator'
import { IS_PUBLIC_KEY } from '../decorators/public.decorator'

@Injectable()
export class ActivationGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ])
    if (isPublic) return true

    const allowUnactivated = this.reflector.getAllAndOverride<boolean>(
      ALLOW_UNACTIVATED_KEY,
      [context.getHandler(), context.getClass()],
    )
    if (allowUnactivated) return true

    const { user }: { user: UserEntity } = context.switchToHttp().getRequest()
    if (!user.activated) throw new ForbiddenException('UNACTIVATED')

    return true
  }
}
