import {
  Injectable,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auths/jwt-auth.guard';

@Injectable()
export class AdminGuard extends JwtAuthGuard {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    await super.canActivate(context);

    const request = context
      .switchToHttp()
      .getRequest<{ user?: { isAdmin?: boolean } }>();
    if (!request.user?.isAdmin) {
      throw new ForbiddenException('Admin access required');
    }

    return true;
  }
}
