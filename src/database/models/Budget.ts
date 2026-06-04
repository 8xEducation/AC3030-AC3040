import { Model } from '@nozbe/watermelondb';
import { field, date } from '@nozbe/watermelondb/decorators';

export default class Budget extends Model {
  static table = 'budgets';

  @field('name') name!: string;
  @field('category_id') categoryId?: string;
  @field('amount') amount!: number;
  @field('timeframe') timeframe!: string;
  @field('anchor_day') anchorDay!: number;
  @field('start_date') startDate!: number;
  @field('end_date') endDate!: number;
  @date('created_at') createdAt!: number;
  @date('updated_at') updatedAt!: number;
}
