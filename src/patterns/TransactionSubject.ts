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
    const results = await Promise.all(
      this.getObservers().map((observer) => observer.onTransactionCreated(transaction, context))
    )
    return results.flat()
  }

  static async notifyUpdated(
    transaction: Transaction,
    oldTransaction: Transaction,
    context?: TransactionContext
  ): Promise<Model[]> {
    const results = await Promise.all(
      this.getObservers().map((observer) =>
        observer.onTransactionUpdated ? observer.onTransactionUpdated(transaction, oldTransaction, context) : Promise.resolve([])
      )
    )
    return results.flat()
  }

  static async notifyDeleted(transaction: Transaction, context?: TransactionContext): Promise<Model[]> {
    const results = await Promise.all(
      this.getObservers().map((observer) =>
        observer.onTransactionDeleted ? observer.onTransactionDeleted(transaction, context) : Promise.resolve([])
      )
    )
    return results.flat()
  }
}
