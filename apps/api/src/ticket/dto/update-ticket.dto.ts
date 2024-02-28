import { OmitType } from '@nestjs/swagger'
import { Transform, Type } from 'class-transformer'
import { IsBoolean, IsNumber } from 'class-validator'
import { CreateTicketDto } from './create-ticket.dto'

export class UpdateTicketDto extends OmitType(CreateTicketDto, [
  'stock',
  'hasImage',
] as const) {
  @IsNumber()
  @Type(() => Number)
  additionalStock?: number = 0

  @IsBoolean()
  @Transform(({ value }: { value: string }) => value === 'true')
  deleteImage?: boolean = false
}
