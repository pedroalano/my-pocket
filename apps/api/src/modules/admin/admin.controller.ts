import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminGuard } from './admin.guard';
import { AdminService } from './admin.service';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';
import {
  ApiAdminStats,
  ApiAdminUsers,
  ApiAdminUpdateUserStatus,
} from './admin.swagger';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(AdminGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  @ApiAdminStats()
  getStats() {
    return this.adminService.getStats();
  }

  @Get('users')
  @ApiAdminUsers()
  getUsers() {
    return this.adminService.getUsers();
  }

  @Patch('users/:id/status')
  @ApiAdminUpdateUserStatus()
  updateUserStatus(
    @Request() req: { user: { userId: string } },
    @Param('id') id: string,
    @Body() dto: UpdateUserStatusDto,
  ) {
    return this.adminService.updateUserStatus(
      req.user.userId,
      id,
      dto.isActive,
    );
  }
}
