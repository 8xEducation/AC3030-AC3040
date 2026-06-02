import { database } from '../database'
import Transaction from '../database/models/Transaction'
import { TransactionType } from '../types'
import { TransactionSubject } from './TransactionSubject'
import { TransactionContext } from './TransactionObserver'
import { AccountObserver } from './AccountObserver'
import { DebtObserver } from './DebtObserver'

// Subscribe observers statically to guarantee they are registered when TransactionFactory is imported
TransactionSubject.subscribe(new AccountObserver())
TransactionSubject.subscribe(new DebtObserver())

export interface CreateTransactionParams {
  accountId: string
  type: TransactionType
  amount: number //Stored as cents (integer)
  description: string
  date: number // timestamp in seconds
  categoryId?: string
  toAccountId?: string
}

export class TransactionFactory {
  /**
   * Creates a transaction and triggers observers inside a single atomic database action.
   */
  static async create(
    params: CreateTransactionParams,
    context?: TransactionContext
  ): Promise<Transaction> {
    return await database.write(async () => {
      const transaction = await database.get<Transaction>('transactions').create((t) => {
        t.accountId = params.accountId
        t.type = params.type
        t.amount = params.amount
        t.description = params.description
        t.date = params.date
        t.categoryId = params.categoryId || ''
        t.toAccountId = params.toAccountId || ''
      })

      // Notify observers (e.g. AccountObserver and DebtObserver) to sync balances
      await TransactionSubject.notifyCreated(transaction, context)

      return transaction
    })
  }

  /**
   * Updates an existing transaction and triggers observers inside a single atomic database action.
   */
  static async update(
    transaction: Transaction,
    params: Partial<CreateTransactionParams>,
    context?: TransactionContext
  ): Promise<Transaction> {
    return await database.write(async () => {
      // Create a snapshot of old transaction values for observers to revert
      const oldTransaction = {
        accountId: transaction.accountId,
        type: transaction.type,
        amount: transaction.amount,
        description: transaction.description,
        date: transaction.date,
        categoryId: transaction.categoryId,
        toAccountId: transaction.toAccountId,
      } as unknown as Transaction

      // Perform updates
      await transaction.update((t) => {
        if (params.accountId !== undefined) t.accountId = params.accountId
        if (params.type !== undefined) t.type = params.type
        if (params.amount !== undefined) t.amount = params.amount
        if (params.description !== undefined) t.description = params.description
        if (params.date !== undefined) t.date = params.date
        if (params.categoryId !== undefined) t.categoryId = params.categoryId || ''
        if (params.toAccountId !== undefined) t.toAccountId = params.toAccountId || ''
      })

      // Notify observers to revert old and apply new balances
      await TransactionSubject.notifyUpdated(transaction, oldTransaction, context)

      return transaction
    })
  }

  /**
   * Deletes a transaction and triggers observers inside a single atomic database action.
   */
  static async delete(
    transaction: Transaction,
    context?: TransactionContext
  ): Promise<void> {
    await database.write(async () => {
      // Notify observers to revert balances before deleting the transaction record
      await TransactionSubject.notifyDeleted(transaction, context)

      await transaction.destroyPermanently()
    })
  }
}
