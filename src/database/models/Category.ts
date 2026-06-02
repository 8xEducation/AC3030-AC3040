import { Model } from '@nozbe/watermelondb';
import { field, date } from '@nozbe/watermelondb/decorators';

export default class Category extends Model {
  static table = 'categories';

  @field('name') name!: string;
  @field('type') type!: string;
  @field('icon') icon!: string;
  @field('color') color!: string;
  @field('is_active') isActive!: boolean;
  @date('created_at') createdAt!: number;
  @date('updated_at') updatedAt!: number;
}
