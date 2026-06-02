import { Database } from '@nozbe/watermelondb'
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite'

import { schema } from './schema'
import Account from './models/Account'
import Transaction from './models/Transaction'
import Debt from './models/Debt'
import Budget from './models/Budget'
import Category from './models/Category'

const adapter = new SQLiteAdapter({
  schema,
  dbName: 'cashflowwave',
  jsi: false,
  onSetUpError: error => {
    console.error('Database setup error:', error)
  },
})

export const database = new Database({
  adapter,
  modelClasses: [Account, Transaction, Debt, Budget, Category],
})
