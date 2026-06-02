import { database } from '../database'
import Account from '../database/models/Account'
import { AccountType, TransactionType } from '../types'
import { TransactionFactory } from '../patterns/TransactionFactory'

export class AccountController {
  /**
   * Creates a new account. If an initial balance is specified, generates
   * a starting balance adjustment transaction.
   */
  static async createAccount(
    name: string,
    type: AccountType,
    initialBalanceInCents: number
  ): Promise<{ success: boolean; data?: Account; error?: string }> {
    if (!name || name.trim() === '') {
      return { success: false, error: 'Account name is required' }
    }

    try {
      // 1. Create the account with a starting balance of 0
      const account = await database.write(async () => {
        return await database.get<Account>('accounts').create((a) => {
          a.name = name.trim()
          a.accountType = type
          a.currentBalance = 0
          a.isActive = true
        })
      })

      // 2. Generate starting balance adjustment transaction if balance is non-zero
      if (initialBalanceInCents !== 0) {
        const isAsset = type === AccountType.ASSET
        const txType = isAsset
          ? (initialBalanceInCents > 0 ? TransactionType.INCOME : TransactionType.EXPENSE)
          : (initialBalanceInCents > 0 ? TransactionType.EXPENSE : TransactionType.INCOME)

        await TransactionFactory.create({
          accountId: account.id,
          type: txType,
          amount: Math.abs(initialBalanceInCents),
          description: 'Starting Balance Adjustment',
          date: Math.floor(Date.now() / 1000),
        })
      }

      // Refresh and return the created account with updated balance
      const updatedAccount = await database.get<Account>('accounts').find(account.id)
      return { success: true, data: updatedAccount }
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to create account' }
    }
  }

  /**
   * Fetches all active accounts.
   */
  static async getActiveAccounts(): Promise<{ success: boolean; data?: Account[]; error?: string }> {
    try {
      const accounts = await database.get<Account>('accounts')
        .query()
        .fetch()
      const activeAccounts = accounts.filter(acc => acc.isActive)
      return { success: true, data: activeAccounts }
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to fetch accounts' }
    }
  }

  /**
   * Soft deletes an account by setting isActive = false.
   */
  static async archiveAccount(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const account = await database.get<Account>('accounts').find(id)
      await database.write(async () => {
        await account.update((acc) => {
          acc.isActive = false
        })
      })
      return { success: true }
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to archive account' }
    }
  }
}
