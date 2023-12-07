import {
  Body,
  Controller,
  Delete,
  Post,
  Put,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common'
import { AuthService } from './auth.service'
import { Request, Response } from 'express'
import { RegisterUserDto } from './dto/register-user.dto'
import { LocalAuthGuard } from './guards/local-auth.guard'
import { Public } from './decorators/public.decorator'
import { RefreshAuthGuard } from './guards/refresh-auth.guard'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  async signUp(@Body() registerUserDto: RegisterUserDto) {
    return await this.authService.registerUser(registerUserDto)
  }

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post()
  async signIn(@Req() req: Request) {
    return await this.authService.login(req.user)
  }

  @Public()
  @UseGuards(RefreshAuthGuard)
  @Put()
  async refreshAuth(@Req() req: Request) {
    return await this.authService.refreshAuth(req.user)
  }

  @Delete()
  async logout(
    @Body('refreshToken') refreshToken: string,
    @Res() res: Response,
  ) {
    await this.authService.logout(refreshToken)

    return res.status(200).json({ status: 'success' })
  }
}
