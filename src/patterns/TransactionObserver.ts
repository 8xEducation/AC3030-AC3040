import Transaction from '../database/models/Transaction'

export interface TransactionContext {
  debtId?: string
}

export interface TransactionObserver {
  onTransactionCreated(transaction: Transaction, context?: TransactionContext): Promise<void>
  onTransactionUpdated?(transaction: Transaction, oldTransaction: Transaction, context?: TransactionContext): Promise<void>
  onTransactionDeleted?(transaction: Transaction, context?: TransactionContext): Promise<void>
}
