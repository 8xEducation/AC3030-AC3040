import { BudgetTimeframeStrategy, BudgetCycle } from './BudgetTimeframeStrategy'
import { TimeService } from '../services/TimeService'

export class WeeklyBudgetStrategy implements BudgetTimeframeStrategy {
  calculateCycle(anchorDay: number, referenceDate: Date = TimeService.getNow()): BudgetCycle {
    const start = new Date(referenceDate)
    const firstDay = TimeService.getFirstDayOfWeek() // 0 = Sunday, 1 = Monday
    
    // JS getDay(): 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    // We want to map current day to a 1-7 range relative to firstDay
    // If firstDay is 1 (Monday): Mon=1, Tue=2, ..., Sun=7
    // If firstDay is 0 (Sunday): Sun=1, Mon=2, ..., Sat=7
    let currentDay = start.getDay() - firstDay + 1
    if (currentDay <= 0) currentDay += 7
    
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
