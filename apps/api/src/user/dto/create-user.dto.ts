import {
  IsAlphanumeric,
  IsEmail,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
} from 'class-validator'

export class CreateUserDto {
  @IsAlphanumeric()
  @IsNotEmpty()
  username: string
  @IsString()
  @IsNotEmpty()
  fullname: string
  @IsEmail()
  @IsNotEmpty()
  email: string
  @IsStrongPassword()
  @IsNotEmpty()
  password: string

  @IsString()
  provider: string
  @IsString()
  image: string
}
