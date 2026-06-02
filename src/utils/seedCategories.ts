import { database } from '../database'
import Category from '../database/models/Category'
import { CategoryType } from '../types'

export const seedDefaultCategories = async () => {
  try {
    const categoryCollection = database.get<Category>('categories')
    const existingCats = await categoryCollection.query().fetch()
    
    if (existingCats.length === 0) {
      await database.write(async () => {
        // Expenses
        await categoryCollection.create((c) => {
          c.name = 'Food & Dining'
          c.type = CategoryType.EXPENSE
          c.color = '#F59E0B'
          c.icon = 'coffee'
          c.isActive = true
        })
        await categoryCollection.create((c) => {
          c.name = 'Shopping'
          c.type = CategoryType.EXPENSE
          c.color = '#EC4899'
          c.icon = 'shopping-bag'
          c.isActive = true
        })
        await categoryCollection.create((c) => {
          c.name = 'Housing & Bills'
          c.type = CategoryType.EXPENSE
          c.color = '#3B82F6'
          c.icon = 'home'
          c.isActive = true
        })
        
        // Income
        await categoryCollection.create((c) => {
          c.name = 'Salary'
          c.type = CategoryType.INCOME
          c.color = '#10B981'
          c.icon = 'briefcase'
          c.isActive = true
        })
        await categoryCollection.create((c) => {
          c.name = 'Freelance'
          c.type = CategoryType.INCOME
          c.color = '#8B5CF6'
          c.icon = 'monitor'
          c.isActive = true
        })
      })
    }
  } catch (e) {
    console.error('Failed to seed categories:', e)
  }
}
