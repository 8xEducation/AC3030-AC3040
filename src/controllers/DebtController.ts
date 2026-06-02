import { database } from '../database'
import Debt from '../database/models/Debt'
import { DebtType, DebtStatus, TransactionType } from '../types'
import { TransactionFactory } from '../patterns/TransactionFactory'

export class DebtController {
  /**
   * Creates a new debt record. Optionally generates a linked transaction
   * to automatically deduct or add funds to an account.
   */
  static async createDebt(params: {
    personName: string
    type: DebtType
    totalAmountInCents: number
    dueDate: number // timestamp in seconds
    accountId: string
    linkToAccount: boolean
  }): Promise<{ success: boolean; data?: Debt; error?: string }> {
    if (!params.personName || params.personName.trim() === '') {
      return { success: false, error: 'Person name is required' }
    }
    if (params.totalAmountInCents <= 0) {
      return { success: false, error: 'Total amount must be greater than zero' }
    }
    if (!params.accountId) {
      return { success: false, error: 'Linked account is required' }
    }

    try {
      const debt = await database.write(async () => {
        return await database.get<Debt>('debts').create((d) => {
          d.personName = params.personName.trim()
          d.type = params.type
          d.totalAmount = params.totalAmountInCents
          d.remainingAmount = params.totalAmountInCents
          d.dueDate = params.dueDate
          d.accountId = params.accountId
          d.status = DebtStatus.OPEN
        })
      })

      // If linking to account, generate the corresponding transaction.
      // NOTE: This initial transaction is NOT marked as a repayment,
      // it just represents the physical cash inflow/outflow.
      if (params.linkToAccount) {
        const txType = params.type === DebtType.LENT
          ? TransactionType.EXPENSE // Money leaves wallet to lend to someone
          : TransactionType.INCOME   // Money enters wallet as we borrow

        await TransactionFactory.create({
          accountId: params.accountId,
          type: txType,
          amount: params.totalAmountInCents,
          description: `${params.type === DebtType.LENT ? 'Lent money to' : 'Borrowed money from'} ${params.personName}`,
          date: Math.floor(Date.now() / 1000),
        })
      }

      return { success: true, data: debt }
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to create debt' }
    }
  }

  /**
   * Records a repayment against a debt.
   * This automatically generates a corresponding transaction and updates
   * both the debt remaining balance and selected account balance through observers.
   */
  static async recordRepayment(
    debtId: string,
    repaymentAmountInCents: number,
    accountId: string
  ): Promise<{ success: boolean; error?: string }> {
    if (repaymentAmountInCents <= 0) {
      return { success: false, error: 'Repayment amount must be greater than zero' }
    }

    try {
      const debt = await database.get<Debt>('debts').find(debtId)

      if (debt.status === DebtStatus.SETTLED || debt.remainingAmount === 0) {
        return { success: false, error: 'Debt is already fully settled' }
      }

      if (repaymentAmountInCents > debt.remainingAmount) {
        return { success: false, error: 'Repayment amount exceeds remaining debt balance' }
      }

      // Repayment transaction details:
      // If we LENT: repayment is cash coming IN (INCOME)
      // If we BORROWED: repayment is cash going OUT (EXPENSE)
      const txType = debt.type === DebtType.LENT ? TransactionType.INCOME : TransactionType.EXPENSE

      await TransactionFactory.create({
        accountId: accountId,
        type: txType,
        amount: repaymentAmountInCents,
        description: `Repayment: ${debt.type === DebtType.LENT ? 'From' : 'To'} ${debt.personName}`,
        date: Math.floor(Date.now() / 1000),
      }, { debtId })

      return { success: true }
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to record repayment' }
    }
  }

  /**
   * Fetches all debts.
   */
  static async getDebts(): Promise<{ success: boolean; data?: Debt[]; error?: string }> {
    try {
      const debts = await database.get<Debt>('debts').query().fetch()
      return { success: true, data: debts }
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to fetch debts' }
    }
  }
}
