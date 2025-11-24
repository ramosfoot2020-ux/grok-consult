import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiCreatedResponse,
  ApiOkResponse,
} from '@nestjs/swagger';

import { JwtUserGuard } from '@src/auth/guards/jwt-user.guard';
import { RequestWithUser } from '@src/common/interfaces/request.interface';
import { RolesGuard } from '@src/auth/guards/roles.guard';
import { RolesEnum } from '@src/users/enums/roles.enum';
import { Roles } from '@src/auth/decorators/roles.decorator';
import { CreateCompanyResponseDto } from '@src/companies/dto/responses/create-company.response.dto';
import { CompanyResponseDto } from '@src/companies/dto/responses/company.response.dto';
import { apiDescriptions } from '@src/common/api-descriptions';
import { GenerateAvatarUrlDto } from '@src/companies/dto/generate-avatar-url.dto';
import { ConfirmAvatarUploadDto } from '@src/companies/dto/confirm-avatar-upload.dto';
import { PresignedUrlResponseDto } from '@src/companies/dto/responses/presigned-url.response.dto';
import { ConfirmUploadResponseDto } from '@src/companies/dto/responses/confirm-upload.response.dto';
import { GetAllCompanyUsersResponseDto } from '@src/companies/dto/responses/company-user.response.dto';
import { GetAllCompanyUsersQueryDto } from '@src/companies/dto/get-all-company-users.query.dto';

import { CreateCompanyDto } from './dto/create-company.dto';
import { CompaniesService } from './companies.service';
import { ChangeCompanyNameDto } from './dto/change-company-name.dto';

@ApiTags('Companies')
@ApiBearerAuth()
@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @ApiOperation({ summary: apiDescriptions.companies.createCompany.summary })
  @ApiCreatedResponse({
    description: apiDescriptions.companies.createCompany.description,
    type: CreateCompanyResponseDto,
  })
  @UseGuards(JwtUserGuard)
  @Post()
  async createCompany(
    @Body() createCompanyDto: CreateCompanyDto,
    @Req() req: RequestWithUser,
  ): Promise<CreateCompanyResponseDto> {
    return this.companiesService.createCompany(createCompanyDto, req.user.userId);
  }

  @ApiOperation({ summary: apiDescriptions.companies.changeCompanyName.summary })
  @ApiOkResponse({
    description: apiDescriptions.companies.changeCompanyName.description,
    type: CompanyResponseDto,
  })
  @Roles(RolesEnum.OWNER)
  @UseGuards(JwtUserGuard, RolesGuard)
  @Patch(':companyId')
  async changeCompanyName(
    @Req() req: RequestWithUser,
    @Body() changeCompanyNameDto: ChangeCompanyNameDto,
    @Param('companyId') companyId: string,
  ): Promise<CompanyResponseDto> {
    return this.companiesService.changeCompanyName(req.user, changeCompanyNameDto, companyId);
  }

  @ApiOperation({ summary: apiDescriptions.companies.getPresignedUrl.summary })
  @ApiOkResponse({
    description: apiDescriptions.companies.getPresignedUrl.description,
    type: PresignedUrlResponseDto,
  })
  @Roles(RolesEnum.OWNER, RolesEnum.COMPANY_MANAGER)
  @UseGuards(JwtUserGuard, RolesGuard)
  @Post(':companyId/avatar-upload-url')
  async getAvatarUploadUrl(
    @Req() req: RequestWithUser,
    @Param('companyId') companyId: string,
    @Body() body: GenerateAvatarUrlDto,
  ): Promise<PresignedUrlResponseDto> {
    return this.companiesService.generateAvatarUploadUrl(
      req.user.companyId,
      companyId,
      body.fileName,
      body.fileType,
    );
  }

  @ApiOperation({ summary: apiDescriptions.companies.confirmUpload.summary })
  @ApiOkResponse({
    description: apiDescriptions.companies.confirmUpload.description,
    type: ConfirmUploadResponseDto,
  })
  @Roles(RolesEnum.OWNER, RolesEnum.COMPANY_MANAGER)
  @UseGuards(JwtUserGuard, RolesGuard)
  @Post(':companyId/avatar-confirm')
  async confirmAvatarUpload(
    @Param('companyId') companyId: string,
    @Body() body: ConfirmAvatarUploadDto,
  ): Promise<ConfirmUploadResponseDto> {
    return this.companiesService.confirmAvatarUpload(companyId, body.uniqueFileName);
  }

  @Get('/users')
  @ApiOperation({ summary: 'Get all users for the current company' })
  @ApiOkResponse({ type: GetAllCompanyUsersResponseDto })
  @UseGuards(JwtUserGuard)
  async getAllCompanyUsers(
    @Req() req: RequestWithUser,
    @Query() query: GetAllCompanyUsersQueryDto,
  ): Promise<GetAllCompanyUsersResponseDto> {
    return this.companiesService.getAllCompanyUsers(req.user, query);
  }
}
