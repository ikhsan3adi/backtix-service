import { IsNotEmpty, IsString } from 'class-validator'

export class ValidateTicketDto {
  @IsString()
  @IsNotEmpty()
  uid: string

  @IsString()
  @IsNotEmpty()
  eventId: string
}
