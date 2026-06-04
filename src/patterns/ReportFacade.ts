import { database } from '../database'
import Transaction from '../database/models/Transaction'
import Category from '../database/models/Category'
import { TransactionType } from '../types'
import { Q } from '@nozbe/watermelondb'
import { TimeService } from '../services/TimeService'

export interface CategoryExpenseReportItem {
  value: number // total in cents or standard units? Better to return cents and let the chart format it.
  color: string
  text: string
  categoryId: string
}

export interface DailyExpenseReportItem {
  value: number // in cents
  label: string // e.g. "Mon", "06/02"
}

export class ReportFacade {
  /**
   * Aggregates expenses by category within a date range for Pie Charts.
   */
  static async getExpensesByCategory(
    startDateSeconds: number,
    endDateSeconds: number
  ): Promise<CategoryExpenseReportItem[]> {
    try {
      // 1. Fetch expenses within date range
      const transactions = await database.get<Transaction>('transactions')
        .query(
          Q.where('type', TransactionType.EXPENSE),
          Q.where('date', Q.between(startDateSeconds, endDateSeconds))
        )
        .fetch()

      // 2. Fetch all categories to map name/color
      const categories = await database.get<Category>('categories').query().fetch()
      const categoryMap = new Map<string, Category>()
      categories.forEach((cat) => categoryMap.set(cat.id, cat))

      // 3. Sum amounts by category ID
      const sumMap = new Map<string, number>()
      transactions.forEach((tx) => {
        const catId = tx.categoryId || 'uncategorized'
        const currentSum = sumMap.get(catId) || 0
        sumMap.set(catId, currentSum + tx.amount)
      })

      // 4. Transform to Gifted Charts structure
      const reportItems: CategoryExpenseReportItem[] = []
      
      sumMap.forEach((totalAmount, catId) => {
        const category = categoryMap.get(catId)
        reportItems.push({
          value: totalAmount,
          color: category?.color || '#94A3B8', // fallback slate color
          text: category?.name || 'Uncategorized',
          categoryId: catId,
        })
      })

      // Sort by value descending
      return reportItems.sort((a, b) => b.value - a.value)
    } catch (error) {
      console.error('Failed to aggregate expenses by category:', error)
      return []
    }
  }

  /**
   * Aggregates expenses daily for a spending trend Bar Chart.
   */
  static async getDailyExpenseTrend(
    daysCount: number = 7
  ): Promise<DailyExpenseReportItem[]> {
    try {
      const now = TimeService.getNow()
      now.setHours(23, 59, 59, 999)
      const endDateSeconds = Math.floor(now.getTime() / 1000)

      const start = new Date(now)
      start.setDate(start.getDate() - daysCount + 1)
      start.setHours(0, 0, 0, 0)
      const startDateSeconds = Math.floor(start.getTime() / 1000)

      // Fetch expenses
      const transactions = await database.get<Transaction>('transactions')
        .query(
          Q.where('type', TransactionType.EXPENSE),
          Q.where('date', Q.between(startDateSeconds, endDateSeconds))
        )
        .fetch()

      // Initialize map with all days in range set to 0
      const trendMap = new Map<string, number>()
      const dayLabels: string[] = []

      for (let i = 0; i < daysCount; i++) {
        const dayDate = new Date(start)
        dayDate.setDate(dayDate.getDate() + i)
        
        // Label format e.g. "Mon", "Tue"
        const label = dayDate.toLocaleDateString('en-US', { weekday: 'short' })
        const dateKey = dayDate.toDateString() // "Tue Jun 02 2026"
        
        trendMap.set(dateKey, 0)
        dayLabels.push(label)
      }

      // Populate totals from transactions
      transactions.forEach((tx) => {
        const txDateString = new Date(tx.date * 1000).toDateString()
        if (trendMap.has(txDateString)) {
          const currentTotal = trendMap.get(txDateString) || 0
          trendMap.set(txDateString, currentTotal + tx.amount)
        }
      })

      // Format output for bar charts
      const result: DailyExpenseReportItem[] = []
      let index = 0
      trendMap.forEach((value, dateKey) => {
        const label = dayLabels[index] || ''
        result.push({
          value,
          label,
        })
        index++
      })

      return result;
    } catch (error) {
      console.error('Failed to generate daily expense trend:', error)
      return []
    }
  }
}
