import { WeeklyBudgetStrategy } from '../../src/patterns/WeeklyBudgetStrategy'
import { MonthlyBudgetStrategy } from '../../src/patterns/MonthlyBudgetStrategy'

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}))

describe('Budget Timeframe Strategies', () => {
  describe('WeeklyBudgetStrategy', () => {
    const strategy = new WeeklyBudgetStrategy()

    it('should correctly calculate the weekly cycle starting on Monday (anchor = 1) for a Tuesday reference date', () => {
      // June 2nd, 2026 is a Tuesday
      const refDate = new Date(2026, 5, 2) 
      const cycle = strategy.calculateCycle(1, refDate)

      // Expect cycle start to be Monday, June 1st, 2026
      expect(cycle.startDate.getFullYear()).toBe(2026)
      expect(cycle.startDate.getMonth()).toBe(5) // June is 5 (0-indexed)
      expect(cycle.startDate.getDate()).toBe(1)
      expect(cycle.startDate.getHours()).toBe(0)
      expect(cycle.startDate.getMinutes()).toBe(0)

      // Expect cycle end to be Sunday, June 7th, 2026
      expect(cycle.endDate.getFullYear()).toBe(2026)
      expect(cycle.endDate.getMonth()).toBe(5)
      expect(cycle.endDate.getDate()).toBe(7)
      expect(cycle.endDate.getHours()).toBe(23)
      expect(cycle.endDate.getMinutes()).toBe(59)
    })

    it('should correctly calculate the weekly cycle starting on Wednesday (anchor = 3) for a Tuesday reference date', () => {
      // June 2nd, 2026 is Tuesday
      const refDate = new Date(2026, 5, 2) 
      const cycle = strategy.calculateCycle(3, refDate)

      // Expect cycle start to be Wednesday, May 27th, 2026 (previous week)
      expect(cycle.startDate.getFullYear()).toBe(2026)
      expect(cycle.startDate.getMonth()).toBe(4) // May is 4
      expect(cycle.startDate.getDate()).toBe(27)

      // Expect cycle end to be Tuesday, June 2nd, 2026
      expect(cycle.endDate.getFullYear()).toBe(2026)
      expect(cycle.endDate.getMonth()).toBe(5) // June
      expect(cycle.endDate.getDate()).toBe(2)
    })
  })

  describe('MonthlyBudgetStrategy', () => {
    const strategy = new MonthlyBudgetStrategy()

    it('should calculate cycle starting in the previous month if reference date is before anchor day', () => {
      // June 2nd, 2026. Anchor is 5th.
      const refDate = new Date(2026, 5, 2)
      const cycle = strategy.calculateCycle(5, refDate)

      // Expect start date to be May 5th, 2026
      expect(cycle.startDate.getFullYear()).toBe(2026)
      expect(cycle.startDate.getMonth()).toBe(4) // May is 4
      expect(cycle.startDate.getDate()).toBe(5)

      // Expect end date to be June 4th, 2026
      expect(cycle.endDate.getFullYear()).toBe(2026)
      expect(cycle.endDate.getMonth()).toBe(5) // June
      expect(cycle.endDate.getDate()).toBe(4)
    })

    it('should calculate cycle starting in the current month if reference date is on or after anchor day', () => {
      // June 6th, 2026. Anchor is 5th.
      const refDate = new Date(2026, 5, 6)
      const cycle = strategy.calculateCycle(5, refDate)

      // Expect start date to be June 5th, 2026
      expect(cycle.startDate.getFullYear()).toBe(2026)
      expect(cycle.startDate.getMonth()).toBe(5) // June
      expect(cycle.startDate.getDate()).toBe(5)

      // Expect end date to be July 4th, 2026
      expect(cycle.endDate.getFullYear()).toBe(2026)
      expect(cycle.endDate.getMonth()).toBe(6) // July is 6
      expect(cycle.endDate.getDate()).toBe(4)
    })

    it('should clamp the anchor day for short months like February', () => {
      // Reference date March 2nd, 2026. Anchor day is 31st.
      // Previous month is February 2026 (non-leap year, 28 days).
      // Anchor 31 should be clamped to Feb 28.
      const refDate = new Date(2026, 2, 2)
      const cycle = strategy.calculateCycle(31, refDate)

      // Expect start date to be February 28th, 2026
      expect(cycle.startDate.getFullYear()).toBe(2026)
      expect(cycle.startDate.getMonth()).toBe(1) // Feb is 1
      expect(cycle.startDate.getDate()).toBe(28)

      // Expect end date to be March 30th, 2026 (day before March 31st candidate)
      expect(cycle.endDate.getFullYear()).toBe(2026)
      expect(cycle.endDate.getMonth()).toBe(2) // March
      expect(cycle.endDate.getDate()).toBe(30)
    })

    it('should correctly handle February leap years during clamping', () => {
      // Reference date March 2nd, 2028 (Leap year, Feb has 29 days).
      // Anchor day is 31st. Anchor 31 should clamp to Feb 29.
      const refDate = new Date(2028, 2, 2)
      const cycle = strategy.calculateCycle(31, refDate)

      // Expect start date to be February 29th, 2028
      expect(cycle.startDate.getFullYear()).toBe(2028)
      expect(cycle.startDate.getMonth()).toBe(1) // Feb is 1
      expect(cycle.startDate.getDate()).toBe(29)

      // Expect end to be March 30th, 2028
      expect(cycle.endDate.getFullYear()).toBe(2028)
      expect(cycle.endDate.getMonth()).toBe(2) // March
      expect(cycle.endDate.getDate()).toBe(30)
    })
  })
})
