import { Model } from '@nozbe/watermelondb';
import { field, date } from '@nozbe/watermelondb/decorators';

export default class Account extends Model {
  static table = 'accounts';

  @field('name') name!: string;
  @field('account_type') accountType!: string;
  @field('current_balance') currentBalance!: number;
  @field('is_active') isActive!: boolean;
  @date('created_at') createdAt!: number;
  @date('updated_at') updatedAt!: number;
}
