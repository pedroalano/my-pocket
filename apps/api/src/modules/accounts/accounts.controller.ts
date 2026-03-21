import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  ParseUUIDPipe,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AccountsService } from './accounts.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { JwtAuthGuard } from '../auths/jwt-auth.guard';
import type { AuthenticatedRequest } from '../auths/interfaces/authenticated-request.interface';

@ApiTags('accounts')
@Controller('accounts')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Get()
  getAllAccounts(@Request() req: AuthenticatedRequest) {
    return this.accountsService.getAllAccounts(req.user.userId);
  }

  @Get(':id')
  getAccountById(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.accountsService.getAccountById(id, req.user.userId);
  }

  @Post()
  createAccount(
    @Body() createAccountDto: CreateAccountDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.accountsService.createAccount(
      createAccountDto,
      req.user.userId,
    );
  }

  @Put(':id')
  updateAccount(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateAccountDto: UpdateAccountDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.accountsService.updateAccount(
      id,
      updateAccountDto,
      req.user.userId,
    );
  }

  @Delete(':id')
  deleteAccount(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.accountsService.deleteAccount(id, req.user.userId);
  }
}
