import { Body, Controller, Ip, Patch, Post, Req, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';

import { RequestWithUser } from '@src/common/interfaces/request.interface';
import { RegistrationResponseDto } from '@src/auth/dto/responses/registration.response.dto';
import { TokensResponseDto } from '@src/auth/dto/responses/tokens.response.dto';
import { SuccessResponseDto } from '@src/auth/dto/responses/success.response.dto';
import { apiDescriptions } from '@src/common/api-descriptions';
import { ChangePasswordDto } from '@src/auth/dto/change-password.dto';
import { Roles } from '@src/auth/decorators/roles.decorator';
import { RolesEnum } from '@src/users/enums/roles.enum';
import { RolesGuard } from '@src/auth/guards/roles.guard';

import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthService } from './auth.service';
import { JwtUserRefreshGuard } from './guards/jwt-refresh-user.guard';
import { OtpService } from './otp.service';
import { SendOtpDto } from './dto/send-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { SetPasswordDto } from './dto/set-password.dto';
import { JwtUserGuard } from './guards/jwt-user.guard';
import { ChangeCompanyDto } from './dto/change-company.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';

@ApiTags('Authorization')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly otpService: OtpService,
  ) {}

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: apiDescriptions.auth.registration.summary })
  @ApiCreatedResponse({
    description: apiDescriptions.auth.registration.description,
    type: RegistrationResponseDto,
  })
  @Post('registration')
  async registration(
    @Body() registerDto: RegisterDto,
    @Ip() userIp: string,
  ): Promise<RegistrationResponseDto> {
    registerDto.userIp = userIp;
    return this.authService.register(registerDto);
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: apiDescriptions.auth.login.summary })
  @ApiCreatedResponse({
    description: apiDescriptions.auth.login.description,
    type: TokensResponseDto,
  })
  @Post('login')
  async login(@Body() loginDto: LoginDto, @Req() req: { ip: string }): Promise<TokensResponseDto> {
    console.log('Login attempt from IP:', req.ip);
    return this.authService.login(loginDto);
  }

  @ApiOperation({ summary: apiDescriptions.auth.logout.summary })
  @ApiOkResponse({ description: apiDescriptions.auth.logout.description, type: SuccessResponseDto })
  @UseGuards(JwtUserRefreshGuard)
  @Post('logout')
  async logout(@Req() req: RequestWithUser): Promise<SuccessResponseDto> {
    return this.authService.logout(req.user.refreshToken);
  }

  @ApiOperation({ summary: apiDescriptions.auth.refreshToken.summary })
  @ApiCreatedResponse({
    description: apiDescriptions.auth.refreshToken.description,
    type: TokensResponseDto,
  })
  @UseGuards(JwtUserRefreshGuard)
  @Post('refresh-token')
  async refreshToken(@Req() req: RequestWithUser): Promise<TokensResponseDto> {
    return this.authService.refreshToken(req.user.refreshToken, req.user.userId);
  }

  @Throttle({ default: { limit: 2, ttl: 60000 } })
  @ApiOperation({ summary: apiDescriptions.auth.sendOtp.summary })
  @ApiCreatedResponse({
    description: apiDescriptions.auth.sendOtp.description,
    type: SuccessResponseDto,
  })
  @Post('send-otp')
  async sendOtp(@Body() { email }: SendOtpDto): Promise<SuccessResponseDto> {
    return this.otpService.sendOtp(email);
  }

  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @ApiOperation({ summary: apiDescriptions.auth.verifyOtp.summary })
  @ApiCreatedResponse({
    description: apiDescriptions.auth.verifyOtp.description,
    type: SuccessResponseDto,
  })
  @Post('verify-otp')
  async verifyOtp(@Body() { email, otp }: VerifyOtpDto): Promise<SuccessResponseDto> {
    return this.otpService.verifyOtp(email, otp);
  }

  @ApiOperation({ summary: apiDescriptions.auth.verifyEmail.summary })
  @ApiCreatedResponse({
    description: apiDescriptions.auth.verifyEmail.description,
    type: SuccessResponseDto,
  })
  @Post('verify-email')
  async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto): Promise<SuccessResponseDto> {
    return this.authService.verifyEmail(verifyEmailDto);
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: apiDescriptions.auth.resetPassword.summary })
  @ApiCreatedResponse({
    description: apiDescriptions.auth.resetPassword.description,
    type: SuccessResponseDto,
  })
  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto): Promise<SuccessResponseDto> {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @ApiOperation({ summary: apiDescriptions.auth.setPassword.summary })
  @ApiOkResponse({
    description: apiDescriptions.auth.setPassword.description,
    type: SuccessResponseDto,
  })
  @ApiBearerAuth()
  @UseGuards(JwtUserGuard)
  @Patch('set-password')
  async setPassword(
    @Body() setPasswordDto: SetPasswordDto,
    @Req() req: RequestWithUser,
  ): Promise<SuccessResponseDto> {
    return this.authService.setPassword(setPasswordDto, req.user.userId);
  }

  @ApiOperation({ summary: apiDescriptions.auth.changeCompany.summary })
  @ApiCreatedResponse({
    description: apiDescriptions.auth.changeCompany.description,
    type: TokensResponseDto,
  })
  @ApiBearerAuth()
  @UseGuards(JwtUserGuard)
  @Post('change-company')
  async changeCompany(
    @Body() changeCompanyDto: ChangeCompanyDto,
    @Req() req: RequestWithUser,
  ): Promise<TokensResponseDto> {
    return this.authService.changeCompany(changeCompanyDto, req.user);
  }

  @ApiOperation({ summary: apiDescriptions.auth.changePassword.summary })
  @ApiCreatedResponse({
    description: apiDescriptions.auth.changePassword.description,
    type: SuccessResponseDto,
  })
  @ApiBearerAuth()
  @Roles(RolesEnum.OWNER, RolesEnum.COMPANY_MANAGER, RolesEnum.USER)
  @UseGuards(JwtUserGuard, RolesGuard)
  @Post('change-password')
  async changePassword(
    @Body() ChangePasswordDto: ChangePasswordDto,
    @Req() req: RequestWithUser,
  ): Promise<SuccessResponseDto> {
    return this.authService.changePassword(ChangePasswordDto, req.user);
  }
}
