import {
  Body,
  Controller,
  Get,
  Post,
  Delete,
  Query,
  Req,
  Param,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiOperation } from '@nestjs/swagger';

import { JwtUserGuard } from '@src/auth/guards/jwt-user.guard';
import { RolesEnum } from '@src/users/enums/roles.enum';
import { Roles } from '@src/auth/decorators/roles.decorator';
import { RolesGuard } from '@src/auth/guards/roles.guard';
import { RequestWithUser } from '@src/common/interfaces/request.interface';
import { AcceptInviteResponseDto } from '@src/invites/dto/responces/accept-invite.response.dto';
import { CreateLinkInviteResponseDto } from '@src/invites/dto/responces/create-link-invite.response.dto';
import { GetAllInvitesResponseDto } from '@src/invites/dto/responces/get-all-invites.response.dto';
import { CreateEmailInviteResponseDto } from '@src/invites/dto/responces/create-email-invite.response.dto';
import { SuccessResponseDto } from '@src/auth/dto/responses/success.response.dto';
import { apiDescriptions } from '@src/common/api-descriptions';

import { InvitesService } from './invites.service';
import { CreateInviteDto } from './dto/create-invite.dto';
import { HandleInviteDto, HandleInviteExistDto } from './dto/handle-invite.dto';
import { GetAllInvitesQueryDto } from './dto/get-all-invites.query.dto';

@Controller('invites')
export class InvitesController {
  constructor(private readonly invitesService: InvitesService) {}

  @ApiOperation({ summary: apiDescriptions.invites.createEmailInvite.summary })
  @ApiCreatedResponse({
    type: CreateEmailInviteResponseDto,
    description: apiDescriptions.invites.createEmailInvite.description,
  })
  @Roles(RolesEnum.OWNER, RolesEnum.COMPANY_MANAGER)
  @UseGuards(JwtUserGuard, RolesGuard)
  @Post('email')
  async createEmailInvite(
    @Body() createInviteDto: CreateInviteDto,
    @Req() req: RequestWithUser,
  ): Promise<CreateEmailInviteResponseDto> {
    return this.invitesService.createEmailInvite(createInviteDto, req.user);
  }

  @ApiOperation({ summary: apiDescriptions.invites.createEmailLinkInvite.summary })
  @ApiCreatedResponse({
    type: CreateLinkInviteResponseDto,
    description: apiDescriptions.invites.createEmailLinkInvite.description,
  })
  @Roles(RolesEnum.OWNER, RolesEnum.COMPANY_MANAGER)
  @ApiBearerAuth()
  @UseGuards(JwtUserGuard, RolesGuard)
  @Post('link')
  async createEmailLinkInvite(
    @Body() createInviteDto: CreateInviteDto,
    @Req() req: RequestWithUser,
  ): Promise<CreateLinkInviteResponseDto> {
    return this.invitesService.createLinkInvite(createInviteDto, req.user);
  }

  @ApiOperation({ summary: apiDescriptions.invites.acceptEmailInvite.summary })
  @ApiCreatedResponse({
    type: AcceptInviteResponseDto,
    description: apiDescriptions.invites.acceptEmailInvite.description,
  })
  @Post('accept/email')
  async acceptEmailInvite(
    @Body() handleInviteDto: HandleInviteDto,
  ): Promise<AcceptInviteResponseDto> {
    return this.invitesService.acceptEmailInvite(handleInviteDto);
  }

  @ApiOperation({ summary: apiDescriptions.invites.acceptEmailExistInvite.summary })
  @ApiCreatedResponse({
    type: AcceptInviteResponseDto,
    description: apiDescriptions.invites.acceptEmailExistInvite.description,
  })
  @Post('accept/email-exist')
  async acceptEmailExistInvite(
    @Body() HandleInviteExistDto: HandleInviteExistDto,
  ): Promise<AcceptInviteResponseDto> {
    return this.invitesService.acceptEmailExistInvite(HandleInviteExistDto);
  }

  @ApiOperation({ summary: apiDescriptions.invites.acceptLinkInvite.summary })
  @ApiCreatedResponse({
    type: AcceptInviteResponseDto,
    description: apiDescriptions.invites.acceptLinkInvite.description,
  })
  @ApiBearerAuth()
  @Post('accept/link')
  async acceptLinkInvite(
    @Body() handleInviteDto: HandleInviteDto,
  ): Promise<AcceptInviteResponseDto> {
    return this.invitesService.acceptLinkInvite(handleInviteDto);
  }

  @ApiOperation({ summary: apiDescriptions.invites.getAllInvites.summary })
  @ApiOkResponse({
    type: GetAllInvitesResponseDto,
    description: apiDescriptions.invites.getAllInvites.summary,
  })
  @ApiBearerAuth()
  @Roles(RolesEnum.OWNER, RolesEnum.COMPANY_MANAGER)
  @UseGuards(JwtUserGuard, RolesGuard)
  @Get()
  async getAllInvites(
    @Query() getAllInvitesQueryDto: GetAllInvitesQueryDto,
    @Req() req: RequestWithUser,
  ): Promise<GetAllInvitesResponseDto> {
    return this.invitesService.getAllInvites(getAllInvitesQueryDto, req.user);
  }

  @ApiOperation({ summary: apiDescriptions.invites.refreshInvite.summary })
  @ApiOkResponse({
    description: apiDescriptions.invites.refreshInvite.description,
    type: SuccessResponseDto,
  })
  @ApiBearerAuth()
  @Roles(RolesEnum.OWNER, RolesEnum.COMPANY_MANAGER)
  @UseGuards(JwtUserGuard, RolesGuard)
  @Post('refresh/:inviteId')
  async refreshInvite(
    @Param('inviteId') inviteId: string,
    @Req() req: RequestWithUser,
  ): Promise<SuccessResponseDto> {
    return this.invitesService.refreshInvite(inviteId, req.user);
  }

  @ApiOperation({ summary: apiDescriptions.invites.deleteInvite.summary })
  @ApiOkResponse({
    description: apiDescriptions.invites.deleteInvite.description,
    type: SuccessResponseDto,
  })
  @ApiBearerAuth()
  @Roles(RolesEnum.OWNER, RolesEnum.COMPANY_MANAGER)
  @UseGuards(JwtUserGuard, RolesGuard)
  @Delete(':inviteId')
  remove(
    @Param('inviteId', ParseUUIDPipe) inviteId: string,
    @Req() req: RequestWithUser,
  ): Promise<SuccessResponseDto> {
    return this.invitesService.remove(inviteId, req.user);
  }
}
