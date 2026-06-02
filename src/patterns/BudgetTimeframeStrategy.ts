export interface BudgetCycle {
  startDate: Date
  endDate: Date
}

export interface BudgetTimeframeStrategy {
  /**
   * Calculates the start and end dates of a budget cycle based on an anchor day and reference date.
   * 
   * @param anchorDay 1-7 for Weekly (1 = Monday, 7 = Sunday), 1-31 for Monthly
   * @param referenceDate The date from which to calculate the cycle (defaults to current date)
   */
  calculateCycle(anchorDay: number, referenceDate?: Date): BudgetCycle
}
