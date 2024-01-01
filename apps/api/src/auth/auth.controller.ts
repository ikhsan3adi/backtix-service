import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import { User } from '../user/decorators/user.decorator'
import { CreateUserDto } from '../user/dto/create-user.dto'
import { UserEntity } from '../user/entities/user.entity'
import { AuthService } from './auth.service'
import { AllowUnactivated } from './decorators/allow-unactivated.decorator'
import { Public } from './decorators/public.decorator'
import { GoogleOauthGuard } from './guards/google-oauth.guard'
import { LocalAuthGuard } from './guards/local-auth.guard'
import { RefreshAuthGuard } from './guards/refresh-auth.guard'

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Sign Up' })
  @Public()
  @Post('register')
  async signUp(@Body() createUserDto: CreateUserDto) {
    return new UserEntity(await this.authService.registerUser(createUserDto))
  }

  @ApiOperation({ summary: 'Sign In' })
  @ApiBody({
    schema: { example: { username: 'user123', password: 'Secret123#' } },
  })
  @ApiResponse({
    status: '2XX',
    schema: {
      example: {
        accessToken: 'exampleJwtAccessToken',
        refreshToken: 'exampleJwtRefreshToken',
      },
    },
  })
  @Public()
  @UseGuards(LocalAuthGuard)
  @Post()
  async signIn(@User() user: UserEntity) {
    return await this.authService.login(user)
  }

  @Public()
  @Get('google')
  @UseGuards(GoogleOauthGuard)
  async requestGoogleAuth() {}

  @Public()
  @Get('google/callback')
  @UseGuards(GoogleOauthGuard)
  async googleAuthCallback(@User() user: UserEntity) {
    return await this.authService.googleSignInOrSignUp(user)
  }

  @ApiOperation({ summary: 'Refresh Authentication' })
  @ApiBody({ schema: { example: { refreshToken: 'exampleJwtRefreshToken' } } })
  @ApiResponse({
    status: '2XX',
    schema: { example: { accessToken: 'exampleJwtAccessToken' } },
  })
  @Public()
  @UseGuards(RefreshAuthGuard)
  @Put()
  async refreshAuth(@User() user: UserEntity) {
    return await this.authService.refreshAuth(user)
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Sign Out' })
  @ApiBody({ schema: { example: { refreshToken: 'exampleJwtRefreshToken' } } })
  @AllowUnactivated()
  @Delete()
  @HttpCode(200)
  async logout(@Body('refreshToken') refreshToken: string) {
    await this.authService.logout(refreshToken)
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Request Activation OTP via email' })
  @AllowUnactivated()
  @Post('activate')
  async requestActivation(@User() user: UserEntity) {
    return await this.authService.requestActivation(user)
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Activate User using OTP' })
  @ApiBody({ schema: { example: { otp: 123456 } } })
  @AllowUnactivated()
  @Patch('activate')
  async activateUser(@User() user: UserEntity, @Body('otp') otp: string) {
    return new UserEntity(await this.authService.activateUser(user, otp))
  }

  @Public()
  @ApiOperation({ summary: '[ADMIN] Request Sign In OTP via email' })
  @Post('admin/login')
  async requestAdminEmailSignIn(@Body('email') email: string) {
    return await this.authService.requestAdminEmailSignIn(email)
  }

  @Public()
  @ApiOperation({ summary: '[ADMIN] Sign In using OTP' })
  @Patch('admin/login')
  async adminOtpSignIn(@Body('otp') otp: string) {
    return await this.authService.adminOtpSignIn(otp)
  }
}
