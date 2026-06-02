import Transaction from '../database/models/Transaction'
import { TransactionObserver, TransactionContext } from './TransactionObserver'

export class TransactionSubject {
  private static observers: TransactionObserver[] = []

  static subscribe(observer: TransactionObserver): void {
    if (!this.observers.includes(observer)) {
      this.observers.push(observer)
    }
  }

  static unsubscribe(observer: TransactionObserver): void {
    this.observers = this.observers.filter((o) => o !== observer)
  }

  static async notifyCreated(transaction: Transaction, context?: TransactionContext): Promise<void> {
    for (const observer of this.observers) {
      await observer.onTransactionCreated(transaction, context)
    }
  }

  static async notifyUpdated(
    transaction: Transaction,
    oldTransaction: Transaction,
    context?: TransactionContext
  ): Promise<void> {
    for (const observer of this.observers) {
      if (observer.onTransactionUpdated) {
        await observer.onTransactionUpdated(transaction, oldTransaction, context)
      }
    }
  }

  static async notifyDeleted(transaction: Transaction, context?: TransactionContext): Promise<void> {
    for (const observer of this.observers) {
      if (observer.onTransactionDeleted) {
        await observer.onTransactionDeleted(transaction, context)
      }
    }
  }
}
