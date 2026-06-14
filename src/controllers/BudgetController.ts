import { database } from '../database'
import Budget from '../database/models/Budget'
import Transaction from '../database/models/Transaction'
import { BudgetTimeframe, TransactionType } from '../types'
import { BudgetStrategyResolver } from '../patterns/BudgetStrategyResolver'
import { Q } from '@nozbe/watermelondb'
import { TimeService } from '../services/TimeService'

export interface BudgetProgress {
  id: string
  name: string
  limitAmount: number // in cents
  spentAmount: number // in cents
  remainingAmount: number // in cents
  progressPercent: number // 0 to 100+
  startDate: number // timestamp in seconds
  endDate: number // timestamp in seconds
  timeframe: BudgetTimeframe
  anchorDay: number
  categoryId?: string
  categoryName?: string
  categoryColor?: string
}

export class BudgetController {
  /**
   * Creates a new budget, calculating initial cycle dates using the Strategy pattern.
   */
  static async createBudget(params: {
    name: string
    amountInCents: number
    timeframe: BudgetTimeframe
    anchorDay: number
    categoryId?: string
  }): Promise<{ success: boolean; data?: Budget; error?: string }> {
    if (!params.name || params.name.trim() === '') {
      return { success: false, error: 'Budget name is required' }
    }
    if (params.amountInCents <= 0) {
      return { success: false, error: 'Budget amount must be greater than zero' }
    }
    
    // Validate anchor day boundaries
    if (params.timeframe === BudgetTimeframe.WEEKLY) {
      if (params.anchorDay < 1 || params.anchorDay > 7) {
        return { success: false, error: 'Weekly anchor day must be between 1 (Monday) and 7 (Sunday)' }
      }
    } else if (params.timeframe === BudgetTimeframe.MONTHLY) {
      if (params.anchorDay < 1 || params.anchorDay > 31) {
        return { success: false, error: 'Monthly anchor day must be between 1 and 31' }
      }
    }

    try {
      // Calculate start and end date for the initial cycle
      const strategy = BudgetStrategyResolver.getStrategy(params.timeframe)
      const cycle = strategy.calculateCycle(params.anchorDay)

      const budget = await database.write(async () => {
        return await database.get<Budget>('budgets').create((b) => {
          b.name = params.name.trim()
          b.categoryId = params.categoryId || ''
          b.amount = params.amountInCents
          b.timeframe = params.timeframe
          b.anchorDay = params.anchorDay
          b.startDate = Math.floor(cycle.startDate.getTime() / 1000)
          b.endDate = Math.floor(cycle.endDate.getTime() / 1000)
        })
      })

      return { success: true, data: budget }
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to create budget' }
    }
  }

  /**
   * Fetches all budgets, dynamically rolls over any expired budget cycles,
   * and calculates current spent progression.
   */
  static async getBudgetsProgress(): Promise<{ success: boolean; data?: BudgetProgress[]; error?: string }> {
    try {
      const budgets = await database.get<Budget>('budgets').query().fetch()
      const now = TimeService.getNow()
      const nowSeconds = Math.floor(now.getTime() / 1000)

      const progressResults: BudgetProgress[] = []

      // Build a category Map once before the loop — O(1) lookup per budget
      // instead of a separate database.find() call per iteration (O(n*m) → O(n+m))
      const allCategories = await database.get<any>('categories').query().fetch()
      const categoryMap = new Map(allCategories.map((c: any) => [c.id, c]))

      for (const budget of budgets) {
        let currentStartDate = budget.startDate
        let currentEndDate = budget.endDate

        // 1. Rollover Check: If current time has moved past the stored end date, recalculate the cycle!
        if (nowSeconds > budget.endDate) {
          const strategy = BudgetStrategyResolver.getStrategy(budget.timeframe as BudgetTimeframe)
          const newCycle = strategy.calculateCycle(budget.anchorDay, now)
          
          currentStartDate = Math.floor(newCycle.startDate.getTime() / 1000)
          currentEndDate = Math.floor(newCycle.endDate.getTime() / 1000)

          // Persist the updated cycle dates in database
          await database.write(async () => {
            await budget.update((b) => {
              b.startDate = currentStartDate
              b.endDate = currentEndDate
            })
          })
        }

        // 2. Fetch and sum all EXPENSE transactions in this budget cycle, optionally filtered by category
        const conditions = [
          Q.where('type', TransactionType.EXPENSE),
          Q.where('date', Q.between(currentStartDate, currentEndDate))
        ];

        if (budget.categoryId) {
          conditions.push(Q.where('category_id', budget.categoryId));
        }

        const transactions = await database.get<Transaction>('transactions')
          .query(...conditions)
          .fetch()

        let categoryName, categoryColor;
        if (budget.categoryId) {
          const cat = categoryMap.get(budget.categoryId)
          if (cat) {
            categoryName = cat.name
            categoryColor = cat.color
          }
        }

        const spentAmount = transactions.reduce((sum, tx) => sum + tx.amount, 0)
        const remainingAmount = Math.max(0, budget.amount - spentAmount)
        const progressPercent = budget.amount > 0 ? (spentAmount / budget.amount) * 100 : 0

        progressResults.push({
          id: budget.id,
          name: budget.name,
          limitAmount: budget.amount,
          spentAmount,
          remainingAmount,
          progressPercent,
          startDate: currentStartDate,
          endDate: currentEndDate,
          timeframe: budget.timeframe as BudgetTimeframe,
          anchorDay: budget.anchorDay,
          categoryId: budget.categoryId,
          categoryName,
          categoryColor,
        })
      }

      return { success: true, data: progressResults }
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to fetch budget progress' }
    }
  }

  /**
   * Deletes a budget.
   */
  static async deleteBudget(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const budget = await database.get<Budget>('budgets').find(id)
      await database.write(async () => {
        await budget.destroyPermanently()
      })
      return { success: true }
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to delete budget' }
    }
  }
}
