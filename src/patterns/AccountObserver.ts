import { database } from '../database'
import Account from '../database/models/Account'
import Transaction from '../database/models/Transaction'
import { TransactionObserver, TransactionContext } from './TransactionObserver'
import { TransactionType, AccountType } from '../types'
import { Model } from '@nozbe/watermelondb'

export class AccountObserver implements TransactionObserver {
  async onTransactionCreated(transaction: Transaction, _context?: TransactionContext): Promise<Model[]> {
    return await this.applyTransactionEffect(transaction)
  }

  async onTransactionUpdated(
    transaction: Transaction,
    oldTransaction: Transaction,
    _context?: TransactionContext
  ): Promise<Model[]> {
    const models: Model[] = []
    models.push(...(await this.revertTransactionEffect(oldTransaction)))
    models.push(...(await this.applyTransactionEffect(transaction)))
    return models
  }

  async onTransactionDeleted(transaction: Transaction, _context?: TransactionContext): Promise<Model[]> {
    return await this.revertTransactionEffect(transaction)
  }

  private async applyTransactionEffect(transaction: Transaction): Promise<Model[]> {
    const { accountId, type, amount, toAccountId } = transaction
    const account = await database.get<Account>('accounts').find(accountId)
    const isAsset = account.accountType === AccountType.ASSET
    const models: Model[] = []

    if (type === TransactionType.INCOME) {
      models.push(account.prepareUpdate((acc) => {
        if (isAsset) acc.currentBalance += amount
        else acc.currentBalance -= amount
      }))
    } else if (type === TransactionType.EXPENSE) {
      models.push(account.prepareUpdate((acc) => {
        if (isAsset) acc.currentBalance -= amount
        else acc.currentBalance += amount
      }))
    } else if (type === TransactionType.TRANSFER) {
      models.push(account.prepareUpdate((acc) => {
        if (isAsset) acc.currentBalance -= amount
        else acc.currentBalance += amount
      }))
      if (toAccountId) {
        const toAccount = await database.get<Account>('accounts').find(toAccountId)
        const isToAsset = toAccount.accountType === AccountType.ASSET
        models.push(toAccount.prepareUpdate((acc) => {
          if (isToAsset) acc.currentBalance += amount
          else acc.currentBalance -= amount
        }))
      }
    }
    return models
  }

  private async revertTransactionEffect(transaction: Transaction): Promise<Model[]> {
    const { accountId, type, amount, toAccountId } = transaction
    const account = await database.get<Account>('accounts').find(accountId)
    const isAsset = account.accountType === AccountType.ASSET
    const models: Model[] = []

    if (type === TransactionType.INCOME) {
      models.push(account.prepareUpdate((acc) => {
        if (isAsset) acc.currentBalance -= amount
        else acc.currentBalance += amount
      }))
    } else if (type === TransactionType.EXPENSE) {
      models.push(account.prepareUpdate((acc) => {
        if (isAsset) acc.currentBalance += amount
        else acc.currentBalance -= amount
      }))
    } else if (type === TransactionType.TRANSFER) {
      models.push(account.prepareUpdate((acc) => {
        if (isAsset) acc.currentBalance += amount
        else acc.currentBalance -= amount
      }))
      if (toAccountId) {
        const toAccount = await database.get<Account>('accounts').find(toAccountId)
        const isToAsset = toAccount.accountType === AccountType.ASSET
        models.push(toAccount.prepareUpdate((acc) => {
          if (isToAsset) acc.currentBalance -= amount
          else acc.currentBalance += amount
        }))
      }
    }
    return models
  }
}
