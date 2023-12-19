import { IsNotEmpty, IsNumberString, IsString } from 'class-validator'

export class UpdateEventImageDto {
  @IsNumberString()
  @IsNotEmpty()
  id: string

  @IsString()
  description: string

  image?: string
}
