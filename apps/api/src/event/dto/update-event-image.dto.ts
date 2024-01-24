import { IsBoolean, IsNotEmpty, IsNumber, IsString } from 'class-validator'

export class UpdateEventImageDto {
  @IsNumber()
  @IsNotEmpty()
  id: number

  @IsString()
  description: string

  @IsBoolean()
  withImage?: boolean = false

  @IsBoolean()
  delete?: boolean = false
}
