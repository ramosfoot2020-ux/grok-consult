import { Body, Controller, Get, Param, Patch, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation } from '@nestjs/swagger';

import { RequestWithUser } from '@src/common/interfaces/request.interface';
import { Roles } from '@src/auth/decorators/roles.decorator';
import { JwtUserGuard } from '@src/auth/guards/jwt-user.guard';
import { RolesGuard } from '@src/auth/guards/roles.guard';
import { RolesEnum } from '@src/users/enums/roles.enum';
import { GetAllUsersResponseDto } from '@src/users-management/dto/responses/get-all-users.response.dto';
import { SuccessResponseDto } from '@src/auth/dto/responses/success.response.dto';

import { GetAllUsersQueryDto } from './dto/get-all-users.query.dto';
import { ChangeUserRoleDto } from './dto/change-user-role.dto';
import { UsersManagementService } from './users-management.service';
import { UpdateUserData } from './dto/update-user-data.dto';

@Controller('users-management')
@ApiBearerAuth()
export class UsersManagementController {
  constructor(private readonly usersManagementService: UsersManagementService) {}

  @ApiOperation({ summary: 'Get a paginated list of users in the company' })
  @ApiOkResponse({ type: GetAllUsersResponseDto })
  @Roles(RolesEnum.OWNER, RolesEnum.COMPANY_MANAGER, RolesEnum.USER)
  @UseGuards(JwtUserGuard, RolesGuard)
  @Get('users')
  async getAllUsers(
    @Req() req: RequestWithUser,
    @Query() getAllUsersQueryDto: GetAllUsersQueryDto,
  ): Promise<GetAllUsersResponseDto> {
    return this.usersManagementService.getAllUsers(req.user, getAllUsersQueryDto);
  }

  @ApiOperation({ summary: "Change a user's role in the company" })
  @ApiOkResponse({ type: SuccessResponseDto })
  @Roles(RolesEnum.OWNER, RolesEnum.COMPANY_MANAGER)
  @UseGuards(JwtUserGuard, RolesGuard)
  @Patch('users/:userId/role')
  async changeUserRole(
    @Req() req: RequestWithUser,
    @Param('userId') userId: string,
    @Body() { role }: ChangeUserRoleDto,
  ): Promise<SuccessResponseDto> {
    return this.usersManagementService.changeUserRole(userId, role, req.user);
  }

  @ApiOperation({ summary: 'Block a user from the company' })
  @ApiOkResponse({ type: SuccessResponseDto })
  @Roles(RolesEnum.OWNER, RolesEnum.COMPANY_MANAGER)
  @UseGuards(JwtUserGuard, RolesGuard)
  @Patch('users/:userId/block')
  async blockUser(
    @Param('userId') userId: string,
    @Req() req: RequestWithUser,
  ): Promise<SuccessResponseDto> {
    return this.usersManagementService.blockUser(userId, req.user);
  }

  @ApiOperation({ summary: 'Unblock a previously blocked user' })
  @ApiOkResponse({ type: SuccessResponseDto })
  @Roles(RolesEnum.OWNER, RolesEnum.COMPANY_MANAGER)
  @UseGuards(JwtUserGuard, RolesGuard)
  @Patch('users/:userId/unblock')
  async unblockUser(
    @Param('userId') userId: string,
    @Req() req: RequestWithUser,
  ): Promise<SuccessResponseDto> {
    return this.usersManagementService.unblockUser(userId, req.user);
  }

  @ApiOperation({ summary: "Update a user's nickname" })
  @ApiOkResponse({ type: SuccessResponseDto })
  @Roles(RolesEnum.OWNER, RolesEnum.COMPANY_MANAGER)
  @UseGuards(JwtUserGuard, RolesGuard)
  @Patch('users/:userId/nickname')
  async updateUserData(
    @Param('userId') userId: string,
    @Req() req: RequestWithUser,
    @Body() updateUserData: UpdateUserData,
  ): Promise<SuccessResponseDto> {
    return this.usersManagementService.updateUserData(userId, req.user, updateUserData);
  }

  @ApiOperation({ summary: 'Delete_ a user from the company' })
  @ApiOkResponse({ type: SuccessResponseDto })
  @Roles(RolesEnum.OWNER, RolesEnum.COMPANY_MANAGER)
  @UseGuards(JwtUserGuard, RolesGuard)
  @Patch('users/:userId/delete')
  async deleteUser(
    @Param('userId') userId: string,
    @Req() req: RequestWithUser,
  ): Promise<SuccessResponseDto> {
    return this.usersManagementService.deleteUser(userId, req.user);
  }
}
