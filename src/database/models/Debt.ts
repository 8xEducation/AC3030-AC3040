import { Model } from '@nozbe/watermelondb';
import { field, date } from '@nozbe/watermelondb/decorators';

export default class Debt extends Model {
  static table = 'debts';

  @field('person_name') personName!: string;
  @field('type') type!: string;
  @field('total_amount') totalAmount!: number;
  @field('remaining_amount') remainingAmount!: number;
  @date('due_date') dueDate!: number;
  @field('account_id') accountId!: string;
  @field('status') status!: string;
  @date('created_at') createdAt!: number;
  @date('updated_at') updatedAt!: number;
}
