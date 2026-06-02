import { BudgetTimeframeStrategy, BudgetCycle } from './BudgetTimeframeStrategy'

export class WeeklyBudgetStrategy implements BudgetTimeframeStrategy {
  calculateCycle(anchorDay: number, referenceDate: Date = new Date()): BudgetCycle {
    const start = new Date(referenceDate)
    
    // Normalize JS day of week (0 = Sunday, 1-6 = Mon-Sat) to ISO (1 = Monday, 7 = Sunday)
    const currentDay = start.getDay() === 0 ? 7 : start.getDay()
    
    let daysToSubtract = currentDay - anchorDay
    if (daysToSubtract < 0) {
      daysToSubtract += 7
    }
    
    start.setDate(start.getDate() - daysToSubtract)
    start.setHours(0, 0, 0, 0)
    
    const end = new Date(start)
    end.setDate(end.getDate() + 6)
    end.setHours(23, 59, 59, 999)
    
    return { startDate: start, endDate: end }
  }
}
