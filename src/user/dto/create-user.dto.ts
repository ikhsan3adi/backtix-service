import {
  IsAlphanumeric,
  IsEmail,
  IsString,
  IsStrongPassword,
} from 'class-validator'

export class CreateUserDto {
  @IsAlphanumeric()
  username: string
  @IsString()
  fullname: string
  @IsEmail()
  email: string
  @IsStrongPassword()
  password: string
}
