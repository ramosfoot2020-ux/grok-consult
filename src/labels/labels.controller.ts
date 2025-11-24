import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { JwtUserGuard } from '@src/auth/guards/jwt-user.guard';
import { RequestWithUser } from '@src/common/interfaces/request.interface';
import { SuccessResponseDto } from '@src/auth/dto/responses/success.response.dto';
import { LabelResponseDto } from '@src/labels/dto/responses/label.response.dto';
import { RolesGuard } from '@src/auth/guards/roles.guard';
import { Roles } from '@src/auth/decorators/roles.decorator';
import { RolesEnum } from '@src/users/enums/roles.enum';
import { apiDescriptions } from '@src/common/api-descriptions';
import { GetAllLabelsResponseDto } from '@src/labels/dto/responses/find-all-label.response.dto';
import { GetAllLabelsQueryDto } from '@src/labels/dto/find-all-label.dto';

import { LabelsService } from './labels.service';
import { CreateLabelDto } from './dto/create-label.dto';
import { UpdateLabelDto } from './dto/update-label.dto';

@ApiTags('Labels')
@ApiBearerAuth()
@UseGuards(JwtUserGuard, RolesGuard)
@Controller('labels')
export class LabelsController {
  constructor(private readonly labelsService: LabelsService) {}

  @Post()
  @ApiOperation({ summary: apiDescriptions.labels.create.summary })
  @ApiCreatedResponse({
    description: apiDescriptions.labels.create.description,
    type: LabelResponseDto,
  })
  @Roles(RolesEnum.OWNER, RolesEnum.COMPANY_MANAGER)
  create(
    @Body() createLabelDto: CreateLabelDto,
    @Req() req: RequestWithUser,
  ): Promise<LabelResponseDto> {
    return this.labelsService.create(createLabelDto, req.user);
  }

  @Get()
  @ApiOperation({ summary: apiDescriptions.labels.findAll.summary })
  @ApiOkResponse({
    description: apiDescriptions.labels.findAll.description,
    type: GetAllLabelsResponseDto,
  })
  findAll(
    @Req() req: RequestWithUser,
    @Query() query: GetAllLabelsQueryDto,
  ): Promise<GetAllLabelsResponseDto> {
    return this.labelsService.findAll(req.user, query);
  }

  @Get(':id')
  @ApiOperation({ summary: apiDescriptions.labels.findOne.summary })
  @ApiOkResponse({
    description: apiDescriptions.labels.findOne.description,
    type: LabelResponseDto,
  })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: RequestWithUser,
  ): Promise<LabelResponseDto> {
    return this.labelsService.findOne(id, req.user);
  }

  @Patch(':id')
  @ApiOperation({ summary: apiDescriptions.labels.update.summary })
  @ApiOkResponse({
    description: apiDescriptions.labels.update.description,
    type: LabelResponseDto,
  })
  @Roles(RolesEnum.OWNER, RolesEnum.COMPANY_MANAGER)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateLabelDto: UpdateLabelDto,
    @Req() req: RequestWithUser,
  ): Promise<LabelResponseDto> {
    return this.labelsService.update(id, updateLabelDto, req.user);
  }

  @Delete(':id')
  @ApiOperation({ summary: apiDescriptions.labels.remove.summary })
  @ApiOkResponse({
    description: apiDescriptions.labels.remove.description,
    type: SuccessResponseDto,
  })
  @Roles(RolesEnum.OWNER, RolesEnum.COMPANY_MANAGER)
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: RequestWithUser,
  ): Promise<SuccessResponseDto> {
    return this.labelsService.remove(id, req.user);
  }
}
