import { database } from '../database'
import Category from '../database/models/Category'
import { CategoryType } from '../types'

export class CategoryController {
  /**
   * Fetch all active categories
   */
  static async getActiveCategories(): Promise<Category[]> {
    const categories = await database.get<Category>('categories').query().fetch()
    return categories.filter(c => c.isActive)
  }

  /**
   * Create a new category
   */
  static async createCategory(
    name: string,
    type: CategoryType,
    color: string = '#4F46E5',
    icon: string = 'Tag'
  ): Promise<Category> {
    let newCategory: Category
    await database.write(async () => {
      newCategory = await database.get<Category>('categories').create(category => {
        category.name = name
        category.type = type
        category.color = color
        category.icon = icon
        category.isActive = true
      })
    })
    return newCategory!
  }

  /**
   * Soft delete a category
   */
  static async deleteCategory(categoryId: string): Promise<void> {
    await database.write(async () => {
      const category = await database.get<Category>('categories').find(categoryId)
      await category.update(cat => {
        cat.isActive = false
      })
    })
  }
}
