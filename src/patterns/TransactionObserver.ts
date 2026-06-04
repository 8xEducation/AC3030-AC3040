import Transaction from '../database/models/Transaction'
import { Model } from '@nozbe/watermelondb'

export interface TransactionContext {
  debtId?: string
}

export interface TransactionObserver {
  onTransactionCreated(transaction: Transaction, context?: TransactionContext): Promise<Model[]>
  onTransactionUpdated?(transaction: Transaction, oldTransaction: Transaction, context?: TransactionContext): Promise<Model[]>
  onTransactionDeleted?(transaction: Transaction, context?: TransactionContext): Promise<Model[]>
}
