import { IsNotEmpty, IsString, IsStrongPassword } from 'class-validator'

export class UpdateUserPasswordDto {
  @IsString()
  @IsNotEmpty()
  oldPassword: string
  @IsStrongPassword()
  @IsNotEmpty()
  newPassword: string
}
