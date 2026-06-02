import { database } from '../database'
import Debt from '../database/models/Debt'
import Transaction from '../database/models/Transaction'
import { TransactionObserver, TransactionContext } from './TransactionObserver'
import { DebtStatus } from '../types'

export class DebtObserver implements TransactionObserver {
  async onTransactionCreated(transaction: Transaction, context?: TransactionContext): Promise<void> {
    if (!context?.debtId) return

    const debt = await database.get<Debt>('debts').find(context.debtId)
    const newRemaining = Math.max(0, debt.remainingAmount - transaction.amount)

    await debt.update((d) => {
      d.remainingAmount = newRemaining
      d.status = newRemaining === 0 ? DebtStatus.SETTLED : DebtStatus.OPEN
    })
  }

  async onTransactionUpdated(
    transaction: Transaction,
    oldTransaction: Transaction,
    context?: TransactionContext
  ): Promise<void> {
    if (!context?.debtId) return

    const debt = await database.get<Debt>('debts').find(context.debtId)
    // Revert old transaction, then apply new transaction
    const revertedRemaining = debt.remainingAmount + oldTransaction.amount
    const newRemaining = Math.max(0, revertedRemaining - transaction.amount)

    await debt.update((d) => {
      d.remainingAmount = newRemaining
      d.status = newRemaining === 0 ? DebtStatus.SETTLED : DebtStatus.OPEN
    })
  }

  async onTransactionDeleted(transaction: Transaction, context?: TransactionContext): Promise<void> {
    if (!context?.debtId) return

    const debt = await database.get<Debt>('debts').find(context.debtId)
    const newRemaining = debt.remainingAmount + transaction.amount

    await debt.update((d) => {
      d.remainingAmount = newRemaining
      d.status = newRemaining === 0 ? DebtStatus.SETTLED : DebtStatus.OPEN
    })
  }
}
