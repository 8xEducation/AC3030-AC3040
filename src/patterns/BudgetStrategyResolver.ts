import { BudgetTimeframe } from '../types'
import { BudgetTimeframeStrategy } from './BudgetTimeframeStrategy'
import { WeeklyBudgetStrategy } from './WeeklyBudgetStrategy'
import { MonthlyBudgetStrategy } from './MonthlyBudgetStrategy'

export class BudgetStrategyResolver {
  private static weekly = new WeeklyBudgetStrategy()
  private static monthly = new MonthlyBudgetStrategy()

  static getStrategy(timeframe: BudgetTimeframe): BudgetTimeframeStrategy {
    if (timeframe === BudgetTimeframe.WEEKLY) {
      return this.weekly
    }
    return this.monthly
  }
}
