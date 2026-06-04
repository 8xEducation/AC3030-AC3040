import { database } from '../database'
import Transaction from '../database/models/Transaction'
import { TransactionType } from '../types'
import { TransactionSubject } from './TransactionSubject'
import { TransactionContext } from './TransactionObserver'

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
      const transaction = database.get<Transaction>('transactions').prepareCreate((t) => {
        t.accountId = params.accountId
        t.type = params.type
        t.amount = params.amount
        t.description = params.description
        t.date = params.date
        t.categoryId = params.categoryId || ''
        t.toAccountId = params.toAccountId || ''
      })

      // Notify observers and collect models to batch
      const observerModels = await TransactionSubject.notifyCreated(transaction, context)
      
      await database.batch(transaction, ...observerModels)

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

      // Prepare updates
      const preparedTransaction = transaction.prepareUpdate((t) => {
        if (params.accountId !== undefined) t.accountId = params.accountId
        if (params.type !== undefined) t.type = params.type
        if (params.amount !== undefined) t.amount = params.amount
        if (params.description !== undefined) t.description = params.description
        if (params.date !== undefined) t.date = params.date
        if (params.categoryId !== undefined) t.categoryId = params.categoryId || ''
        if (params.toAccountId !== undefined) t.toAccountId = params.toAccountId || ''
      })

      // Notify observers to collect batched model updates
      const observerModels = await TransactionSubject.notifyUpdated(transaction, oldTransaction, context)

      await database.batch(preparedTransaction, ...observerModels)

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
      // Collect observer updates
      const observerModels = await TransactionSubject.notifyDeleted(transaction, context)

      await database.batch(
        transaction.prepareDestroyPermanently(),
        ...observerModels
      )
    })
  }
}
