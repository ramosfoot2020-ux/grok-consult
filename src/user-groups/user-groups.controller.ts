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
import { RolesGuard } from '@src/auth/guards/roles.guard';
import { Roles } from '@src/auth/decorators/roles.decorator';
import { RolesEnum } from '@src/users/enums/roles.enum';

import { UserGroupsService } from './user-groups.service';
import { CreateUserGroupDto } from './dto/create-user-group.dto';
import { UpdateUserGroupDto } from './dto/update-user-group.dto';
import { GetAllUserGroupsQueryDto } from './dto/get-all-user-groups-query.dto';
import {
  GetAllUserGroupsResponseDto,
  UserGroupDetailedResponseDto,
} from './dto/responses/user-group.response.dto';

@ApiTags('User Groups')
@ApiBearerAuth()
@UseGuards(JwtUserGuard, RolesGuard)
@Controller('user-groups')
export class UserGroupsController {
  constructor(private readonly userGroupsService: UserGroupsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user group' })
  @ApiCreatedResponse({
    description: 'The user group has been successfully created.',
    type: UserGroupDetailedResponseDto,
  })
  @Roles(RolesEnum.OWNER, RolesEnum.COMPANY_MANAGER)
  create(
    @Body() createUserGroupDto: CreateUserGroupDto,
    @Req() req: RequestWithUser,
  ): Promise<UserGroupDetailedResponseDto> {
    return this.userGroupsService.create(createUserGroupDto, req.user);
  }

  @Get()
  @ApiOperation({ summary: 'Get all user groups for the company' })
  @ApiOkResponse({
    description: 'A paginated list of user groups.',
    type: GetAllUserGroupsResponseDto,
  })
  findAll(
    @Req() req: RequestWithUser,
    @Query() query: GetAllUserGroupsQueryDto,
  ): Promise<GetAllUserGroupsResponseDto> {
    return this.userGroupsService.findAll(req.user, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific user group by ID' })
  @ApiOkResponse({
    description: 'The user group details.',
    type: UserGroupDetailedResponseDto,
  })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: RequestWithUser,
  ): Promise<UserGroupDetailedResponseDto> {
    return this.userGroupsService.findOne(id, req.user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a user group by ID' })
  @ApiOkResponse({
    description: 'The user group has been successfully updated.',
    type: UserGroupDetailedResponseDto,
  })
  @Roles(RolesEnum.OWNER, RolesEnum.COMPANY_MANAGER)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserGroupDto: UpdateUserGroupDto,
    @Req() req: RequestWithUser,
  ): Promise<UserGroupDetailedResponseDto> {
    return this.userGroupsService.update(id, updateUserGroupDto, req.user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a user group by ID' })
  @ApiOkResponse({
    description: 'The user group has been successfully deleted.',
    type: SuccessResponseDto,
  })
  @Roles(RolesEnum.OWNER, RolesEnum.COMPANY_MANAGER)
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: RequestWithUser,
  ): Promise<SuccessResponseDto> {
    return this.userGroupsService.remove(id, req.user);
  }
}
