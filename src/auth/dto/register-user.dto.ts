import {
  IsAlphanumeric,
  IsEmail,
  IsString,
  IsStrongPassword,
} from 'class-validator'

export class RegisterUserDto {
  @IsAlphanumeric()
  username: string
  @IsString()
  fullname: string
  @IsEmail()
  email: string
  @IsStrongPassword()
  password: string
}
