import { appSchema, tableSchema } from '@nozbe/watermelondb';

export const schema = appSchema({
  version: 2,
  tables: [
    tableSchema({
      name: 'accounts',
      columns: [
        { name: 'name', type: 'string' },
        { name: 'account_type', type: 'string' },
        { name: 'current_balance', type: 'number' },
        { name: 'is_active', type: 'boolean' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ]
    }),
    tableSchema({
      name: 'transactions',
      columns: [
        { name: 'account_id', type: 'string' },
        { name: 'type', type: 'string' },
        { name: 'amount', type: 'number' },
        { name: 'description', type: 'string' },
        { name: 'date', type: 'number' },
        { name: 'category_id', type: 'string', isOptional: true },
        { name: 'to_account_id', type: 'string', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ]
    }),
    tableSchema({
      name: 'debts',
      columns: [
        { name: 'person_name', type: 'string' },
        { name: 'type', type: 'string' },
        { name: 'total_amount', type: 'number' },
        { name: 'remaining_amount', type: 'number' },
        { name: 'due_date', type: 'number' },
        { name: 'account_id', type: 'string' },
        { name: 'status', type: 'string' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ]
    }),
    tableSchema({
      name: 'budgets',
      columns: [
        { name: 'name', type: 'string' },
        { name: 'category_id', type: 'string', isOptional: true },
        { name: 'amount', type: 'number' },
        { name: 'timeframe', type: 'string' },
        { name: 'anchor_day', type: 'number' },
        { name: 'start_date', type: 'number' },
        { name: 'end_date', type: 'number' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ]
    }),
    tableSchema({
      name: 'categories',
      columns: [
        { name: 'name', type: 'string' },
        { name: 'type', type: 'string' },
        { name: 'icon', type: 'string', isOptional: true },
        { name: 'color', type: 'string', isOptional: true },
        { name: 'is_active', type: 'boolean' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ]
    }),
  ]
});
