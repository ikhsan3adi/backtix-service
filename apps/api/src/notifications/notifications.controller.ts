import { Controller, Get, Patch, Query } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { User } from '../user/decorators/user.decorator'
import { UserEntity } from '../user/entities/user.entity'
import { NotificationEntity } from './entities/notification.entity'
import { NotificationsService } from './notifications.service'

@ApiTags('notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async findAllImportantByUserId(
    @Query('page') page: number,
    @Query('from') from: string,
    @User() user: UserEntity,
  ) {
    return (
      await this.notificationsService.findAllImportant(user, page, from)
    ).map((e) => new NotificationEntity(e))
  }

  @Get('info')
  async findAllInfo(
    @Query('page') page: number,
    @Query('from') from: string,
    @User() user: UserEntity,
  ) {
    return (await this.notificationsService.findAllInfo(user, page, from)).map(
      (e) => new NotificationEntity(e),
    )
  }

  @Patch('read')
  async readAllNotification(@User() user: UserEntity) {
    return await this.notificationsService.readAllNotification(user)
  }

  @Patch('/:id/read')
  async readNotification(@User() user: UserEntity, id: number) {
    return await this.notificationsService.readNotification(user, id)
  }
}
