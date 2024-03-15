import { $Enums } from '@prisma/client'

export class CreateNotificationDto {
  id?: number
  userId?: string
  message: string
  type: $Enums.NotificationType
  entityType?: $Enums.NotificationEntityType
  entityId?: string
}
