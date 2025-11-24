import { Body, Controller, Get, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation } from '@nestjs/swagger';

import { RequestWithUser } from '@src/common/interfaces/request.interface';
import { UserProfileResponseDto } from '@src/users/dto/responses/ser-profile.response.dto';
import { apiDescriptions } from '@src/common/api-descriptions';
import { JwtUserMeGuard } from '@src/auth/guards/jwt-user-me.guard';
import { PresignedUrlResponseDto } from '@src/companies/dto/responses/presigned-url.response.dto';
import { GenerateAvatarUrlDto } from '@src/companies/dto/generate-avatar-url.dto';
import { ConfirmUploadResponseDto } from '@src/companies/dto/responses/confirm-upload.response.dto';
import { ConfirmAvatarUploadDto } from '@src/companies/dto/confirm-avatar-upload.dto';
import { JwtUserGuard } from '@src/auth/guards/jwt-user.guard';
import { UpdateMyProfileDto } from '@src/users/dto/update-my-profile.dto';

import { UsersService } from './users.service';

@Controller('users')
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: apiDescriptions.users.me.summary })
  @ApiOkResponse({
    description: apiDescriptions.users.me.description,
    type: UserProfileResponseDto,
  })
  @UseGuards(JwtUserMeGuard)
  @Get('me')
  async getMyProfile(@Req() req: RequestWithUser): Promise<UserProfileResponseDto> {
    return this.usersService.getMyProfile(req.user);
  }

  @Patch('me')
  @ApiOperation({ summary: apiDescriptions.users.updateMe.summary })
  @ApiOkResponse({
    description: apiDescriptions.users.updateMe.description,
    type: UserProfileResponseDto,
  })
  @UseGuards(JwtUserGuard)
  async updateMyProfile(
    @Req() req: RequestWithUser,
    @Body() dto: UpdateMyProfileDto,
  ): Promise<UserProfileResponseDto> {
    return this.usersService.updateMyProfile(req.user, dto);
  }

  @Post('me/avatar-upload-url')
  @ApiOperation({ summary: apiDescriptions.users.getAvatarUploadUrl.summary })
  @ApiOkResponse({
    description: apiDescriptions.users.getAvatarUploadUrl.description,
    type: PresignedUrlResponseDto,
  })
  @UseGuards(JwtUserGuard)
  async getAvatarUploadUrl(
    @Req() req: RequestWithUser,
    @Body() body: GenerateAvatarUrlDto,
  ): Promise<PresignedUrlResponseDto> {
    return this.usersService.generateAvatarUploadUrl(req.user.userId, body.fileName, body.fileType);
  }

  @Post('me/avatar-confirm')
  @ApiOperation({ summary: apiDescriptions.users.confirmAvatarUpload.summary })
  @ApiOkResponse({
    description: apiDescriptions.users.confirmAvatarUpload.summary,
    type: ConfirmUploadResponseDto,
  })
  @UseGuards(JwtUserGuard)
  async confirmAvatarUpload(
    @Req() req: RequestWithUser,
    @Body() body: ConfirmAvatarUploadDto,
  ): Promise<ConfirmUploadResponseDto> {
    return this.usersService.confirmAvatarUpload(req.user.userId, body.uniqueFileName);
  }
}
