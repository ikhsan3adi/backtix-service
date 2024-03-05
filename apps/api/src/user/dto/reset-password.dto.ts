import { IsNotEmpty, IsNumberString, IsStrongPassword } from 'class-validator'

export class ResetPasswordDto {
  @IsNumberString()
  @IsNotEmpty()
  resetCode: string

  @IsStrongPassword()
  @IsNotEmpty()
  newPassword: string
}
