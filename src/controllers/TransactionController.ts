import { database } from '../database'
import Transaction from '../database/models/Transaction'
import { TransactionType } from '../types'
import { TransactionFactory, CreateTransactionParams } from '../patterns/TransactionFactory'
import { TransactionContext } from '../patterns/TransactionObserver'

export class TransactionController {
  /**
   * Creates a transaction after performing input validation.
   */
  static async createTransaction(
    params: CreateTransactionParams,
    context?: TransactionContext
  ): Promise<{ success: boolean; data?: Transaction; error?: string }> {
    // 1. Validation
    if (!params.accountId) {
      return { success: false, error: 'Source account is required' }
    }
    if (params.amount <= 0) {
      return { success: false, error: 'Amount must be greater than zero' }
    }
    if (!params.type || !Object.values(TransactionType).includes(params.type)) {
      return { success: false, error: 'Invalid transaction type' }
    }
    if (params.type === TransactionType.TRANSFER) {
      if (!params.toAccountId) {
        return { success: false, error: 'Destination account is required for transfers' }
      }
      if (params.accountId === params.toAccountId) {
        return { success: false, error: 'Source and destination accounts cannot be the same' }
      }
    }

    try {
      const transaction = await TransactionFactory.create(params, context)
      return { success: true, data: transaction }
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to create transaction' }
    }
  }

  /**
   * Updates an existing transaction after validating the parameters.
   */
  static async updateTransaction(
    id: string,
    params: Partial<CreateTransactionParams>,
    context?: TransactionContext
  ): Promise<{ success: boolean; data?: Transaction; error?: string }> {
    try {
      // 1. Validation of updates
      if (params.amount !== undefined && params.amount <= 0) {
        return { success: false, error: 'Amount must be greater than zero' }
      }

      const transaction = await database.get<Transaction>('transactions').find(id)

      const finalType = params.type !== undefined ? params.type : transaction.type as TransactionType
      const finalFrom = params.accountId !== undefined ? params.accountId : transaction.accountId
      const finalTo = params.toAccountId !== undefined ? params.toAccountId : transaction.toAccountId

      if (finalType === TransactionType.TRANSFER) {
        if (!finalTo) {
          return { success: false, error: 'Destination account is required for transfers' }
        }
        if (finalFrom === finalTo) {
          return { success: false, error: 'Source and destination accounts cannot be the same' }
        }
      }

      const updatedTransaction = await TransactionFactory.update(transaction, params, context)
      return { success: true, data: updatedTransaction }
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to update transaction' }
    }
  }

  /**
   * Deletes a transaction.
   */
  static async deleteTransaction(
    id: string,
    context?: TransactionContext
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const transaction = await database.get<Transaction>('transactions').find(id)
      await TransactionFactory.delete(transaction, context)
      return { success: true }
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to delete transaction' }
    }
  }

  /**
   * Fetches all transactions sorted by date descending.
   */
  static async getTransactions(): Promise<{ success: boolean; data?: Transaction[]; error?: string }> {
    try {
      const transactions = await database.get<Transaction>('transactions')
        .query()
        .fetch()
      
      // Sort in memory by date descending (latest first)
      const sortedTransactions = [...transactions].sort((a, b) => b.date - a.date)
      return { success: true, data: sortedTransactions }
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to fetch transactions' }
    }
  }
}
