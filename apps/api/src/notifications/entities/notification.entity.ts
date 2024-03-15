import { ApiProperty } from '@nestjs/swagger'
import { $Enums } from '@prisma/client'

export class NotificationEntity {
  constructor(partial: Partial<NotificationEntity>) {
    Object.assign(this, partial)
  }

  id: number
  userId?: string
  message: string

  @ApiProperty({ enum: $Enums.NotificationType })
  type: string
  @ApiProperty({ enum: $Enums.NotificationEntityType })
  entityType?: string
  entityId?: string
  createdAt: Date
  updatedAt?: Date
}
