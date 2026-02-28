import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { configurations, envValidationSchema } from './modules/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthModule } from './modules/health/health.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { TransactionsModule } from './modules/transactions/transactions.module';
import { BudgetModule } from './modules/budgets/budget.module';
import { AuthsModule } from './modules/auths/auths.module';
import { SharedModule } from './modules/shared';
import { DashboardModule } from './modules/dashboard/dashboard.module';

const envFileMap: Record<string, string> = {
  test: '.env.test',
  docker: '.env.docker',
};

const resolveEnvFilePath = () =>
  envFileMap[process.env.NODE_ENV ?? ''] ?? '.env';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: resolveEnvFilePath(),
      load: configurations,
      validationSchema: envValidationSchema,
      validationOptions: {
        abortEarly: false,
      },
    }),
    SharedModule,
    HealthModule,
    CategoriesModule,
    TransactionsModule,
    BudgetModule,
    AuthsModule,
    DashboardModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
