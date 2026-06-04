import { BudgetTimeframeStrategy, BudgetCycle } from './BudgetTimeframeStrategy'
import { TimeService } from '../services/TimeService'

export class MonthlyBudgetStrategy implements BudgetTimeframeStrategy {
  calculateCycle(anchorDay: number, referenceDate: Date = TimeService.getNow()): BudgetCycle {
    const ref = new Date(referenceDate)
    const year = ref.getFullYear()
    const month = ref.getMonth() // 0-indexed (0 = Jan, 11 = Dec)

    // Helper to get maximum days in a specific year/month combination
    const getMaxDayOfMonth = (y: number, m: number): number => {
      return new Date(y, m + 1, 0).getDate()
    }

    // 1. Create a candidate start date in the current month
    const currentMonthMax = getMaxDayOfMonth(year, month)
    const currentMonthClampedDay = Math.min(anchorDay, currentMonthMax)
    const currentMonthCandidate = new Date(year, month, currentMonthClampedDay, 0, 0, 0, 0)

    let startDate: Date
    let endDate: Date

    if (ref.getTime() >= currentMonthCandidate.getTime()) {
      // The cycle started in the current month
      startDate = currentMonthCandidate

      // Calculate next month's anchor start
      const nextMonthYear = month === 11 ? year + 1 : year
      const nextMonth = month === 11 ? 0 : month + 1
      const nextMonthMax = getMaxDayOfMonth(nextMonthYear, nextMonth)
      const nextMonthClampedDay = Math.min(anchorDay, nextMonthMax)
      const nextMonthCandidate = new Date(nextMonthYear, nextMonth, nextMonthClampedDay, 0, 0, 0, 0)

      endDate = new Date(nextMonthCandidate.getTime() - 1)
    } else {
      // The cycle started in the previous month
      const prevMonthYear = month === 0 ? year - 1 : year
      const prevMonth = month === 0 ? 11 : month - 1
      const prevMonthMax = getMaxDayOfMonth(prevMonthYear, prevMonth)
      const prevMonthClampedDay = Math.min(anchorDay, prevMonthMax)
      
      startDate = new Date(prevMonthYear, prevMonth, prevMonthClampedDay, 0, 0, 0, 0)
      endDate = new Date(currentMonthCandidate.getTime() - 1)
    }

    return { startDate, endDate }
  }
}
