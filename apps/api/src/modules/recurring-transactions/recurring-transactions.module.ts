import { Module } from '@nestjs/common';
import { RecurringTransactionsController } from './recurring-transactions.controller';
import { RecurringTransactionsService } from './recurring-transactions.service';
import { RecurringTransactionsScheduler } from './recurring-transactions.scheduler';
import { TransactionsModule } from '../transactions/transactions.module';
import { CategoriesModule } from '../categories/categories.module';
import { SharedModule } from '../shared/shared.module';

@Module({
  imports: [TransactionsModule, CategoriesModule, SharedModule],
  controllers: [RecurringTransactionsController],
  providers: [RecurringTransactionsService, RecurringTransactionsScheduler],
})
export class RecurringTransactionsModule {}
