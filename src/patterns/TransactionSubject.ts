import Transaction from '../database/models/Transaction'
import { Model } from '@nozbe/watermelondb'
import { TransactionObserver, TransactionContext } from './TransactionObserver'
import { AccountObserver } from './AccountObserver'
import { DebtObserver } from './DebtObserver'

export class TransactionSubject {
  private static observers: TransactionObserver[] = []
  private static initialized = false

  private static getObservers(): TransactionObserver[] {
    if (!this.initialized) {
      this.observers = [new AccountObserver(), new DebtObserver()]
      this.initialized = true
    }
    return this.observers
  }

  static subscribe(observer: TransactionObserver): void {
    const obs = this.getObservers()
    if (!obs.some(o => o.constructor.name === observer.constructor.name)) {
      obs.push(observer)
    }
  }

  static unsubscribe(observer: TransactionObserver): void {
    this.observers = this.getObservers().filter((o) => o !== observer)
  }

  static async notifyCreated(transaction: Transaction, context?: TransactionContext): Promise<Model[]> {
    const modelsToBatch: Model[] = []
    for (const observer of this.getObservers()) {
      const result = await observer.onTransactionCreated(transaction, context)
      modelsToBatch.push(...result)
    }
    return modelsToBatch
  }

  static async notifyUpdated(
    transaction: Transaction,
    oldTransaction: Transaction,
    context?: TransactionContext
  ): Promise<Model[]> {
    const modelsToBatch: Model[] = []
    for (const observer of this.getObservers()) {
      if (observer.onTransactionUpdated) {
        const result = await observer.onTransactionUpdated(transaction, oldTransaction, context)
        modelsToBatch.push(...result)
      }
    }
    return modelsToBatch
  }

  static async notifyDeleted(transaction: Transaction, context?: TransactionContext): Promise<Model[]> {
    const modelsToBatch: Model[] = []
    for (const observer of this.getObservers()) {
      if (observer.onTransactionDeleted) {
        const result = await observer.onTransactionDeleted(transaction, context)
        modelsToBatch.push(...result)
      }
    }
    return modelsToBatch
  }
}
