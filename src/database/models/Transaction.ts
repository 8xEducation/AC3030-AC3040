import { Model } from '@nozbe/watermelondb';
import { field, date } from '@nozbe/watermelondb/decorators';

export default class Transaction extends Model {
  static table = 'transactions';

  @field('account_id') accountId!: string;
  @field('type') type!: string;
  @field('amount') amount!: number;
  @field('description') description!: string;
  @date('date') date!: number;
  @field('category_id') categoryId!: string;
  @field('to_account_id') toAccountId!: string;
  @date('created_at') createdAt!: number;
  @date('updated_at') updatedAt!: number;
}
