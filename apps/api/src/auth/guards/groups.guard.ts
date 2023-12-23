import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { GROUPS_KEY } from '../decorators/groups.decorator'
import { UserEntity } from '../../user/entities/user.entity'
import { Group } from '../../user/enums/group.enum'

@Injectable()
export class GroupsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredGroups = this.reflector.getAllAndOverride<Group[]>(
      GROUPS_KEY,
      [context.getHandler(), context.getClass()],
    )
    if (!requiredGroups) return true

    const { user }: { user: UserEntity } = context.switchToHttp().getRequest()
    return requiredGroups.some((group) => user.groups?.includes(group))
  }
}
