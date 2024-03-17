import { $Enums } from '@prisma/client'

export class CreateNotificationDto {
  constructor(partial: Partial<CreateNotificationDto>) {
    Object.assign(this, partial)
  }

  id?: number
  userId?: string
  message: string
  type: $Enums.NotificationType
  entityType?: $Enums.NotificationEntityType
  entityId?: string
}
