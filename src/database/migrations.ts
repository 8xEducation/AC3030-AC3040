import { schemaMigrations, addColumns } from '@nozbe/watermelondb/Schema/migrations';

export default schemaMigrations({
  migrations: [
    {
      toVersion: 2,
      steps: [
        addColumns({
          table: 'budgets',
          columns: [
            { name: 'category_id', type: 'string', isOptional: true },
          ],
        }),
      ],
    },
  ],
});
