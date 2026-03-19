import {
  Injectable,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { I18nService, I18nContext } from 'nestjs-i18n';
import { JwtAuthGuard } from '../auths/jwt-auth.guard';

@Injectable()
export class AdminGuard extends JwtAuthGuard {
  constructor(private readonly i18n: I18nService) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    await super.canActivate(context);

    const request = context
      .switchToHttp()
      .getRequest<{ user?: { isAdmin?: boolean } }>();
    if (!request.user?.isAdmin) {
      const lang = I18nContext.current()?.lang ?? 'en';
      throw new ForbiddenException(
        this.i18n.t('auth.errors.adminAccessRequired', { lang }),
      );
    }

    return true;
  }
}
