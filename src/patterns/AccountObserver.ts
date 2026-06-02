import { database } from '../database'
import Account from '../database/models/Account'
import Transaction from '../database/models/Transaction'
import { TransactionObserver, TransactionContext } from './TransactionObserver'
import { TransactionType, AccountType } from '../types'

export class AccountObserver implements TransactionObserver {
  async onTransactionCreated(transaction: Transaction, _context?: TransactionContext): Promise<void> {
    await this.applyTransactionEffect(transaction)
  }

  async onTransactionUpdated(
    transaction: Transaction,
    oldTransaction: Transaction,
    _context?: TransactionContext
  ): Promise<void> {
    // Revert the old transaction's effect, then apply the new transaction's effect.
    await this.revertTransactionEffect(oldTransaction)
    await this.applyTransactionEffect(transaction)
  }

  async onTransactionDeleted(transaction: Transaction, _context?: TransactionContext): Promise<void> {
    // Revert the deleted transaction's effect.
    await this.revertTransactionEffect(transaction)
  }

  private async applyTransactionEffect(transaction: Transaction): Promise<void> {
    const { accountId, type, amount, toAccountId } = transaction
    const account = await database.get<Account>('accounts').find(accountId)
    const isAsset = account.accountType === AccountType.ASSET

    if (type === TransactionType.INCOME) {
      await account.update((acc) => {
        if (isAsset) {
          acc.currentBalance += amount
        } else {
          acc.currentBalance -= amount
        }
      })
    } else if (type === TransactionType.EXPENSE) {
      await account.update((acc) => {
        if (isAsset) {
          acc.currentBalance -= amount
        } else {
          acc.currentBalance += amount
        }
      })
    } else if (type === TransactionType.TRANSFER) {
      await account.update((acc) => {
        if (isAsset) {
          acc.currentBalance -= amount
        } else {
          acc.currentBalance += amount
        }
      })
      if (toAccountId) {
        const toAccount = await database.get<Account>('accounts').find(toAccountId)
        const isToAsset = toAccount.accountType === AccountType.ASSET
        await toAccount.update((acc) => {
          if (isToAsset) {
            acc.currentBalance += amount
          } else {
            acc.currentBalance -= amount
          }
        })
      }
    }
  }

  private async revertTransactionEffect(transaction: Transaction): Promise<void> {
    const { accountId, type, amount, toAccountId } = transaction
    const account = await database.get<Account>('accounts').find(accountId)
    const isAsset = account.accountType === AccountType.ASSET

    if (type === TransactionType.INCOME) {
      await account.update((acc) => {
        if (isAsset) {
          acc.currentBalance -= amount
        } else {
          acc.currentBalance += amount
        }
      })
    } else if (type === TransactionType.EXPENSE) {
      await account.update((acc) => {
        if (isAsset) {
          acc.currentBalance += amount
        } else {
          acc.currentBalance -= amount
        }
      })
    } else if (type === TransactionType.TRANSFER) {
      await account.update((acc) => {
        if (isAsset) {
          acc.currentBalance += amount
        } else {
          acc.currentBalance -= amount
        }
      })
      if (toAccountId) {
        const toAccount = await database.get<Account>('accounts').find(toAccountId)
        const isToAsset = toAccount.accountType === AccountType.ASSET
        await toAccount.update((acc) => {
          if (isToAsset) {
            acc.currentBalance -= amount
          } else {
            acc.currentBalance += amount
          }
        })
      }
    }
  }
}
