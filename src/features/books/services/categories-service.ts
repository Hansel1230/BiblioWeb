import { apiGet } from '../../../lib/api/client'
import { dataSource } from '../../../lib/api/config'
import { endpoints } from '../../../lib/api/endpoints'
import { defaultMockCategories } from '../../../mocks/data'
import type { Category } from '../../../types'

type CategoryResponse = {
  id: number
  name: string
}

export function getCategories(): Promise<Category[]> {
  return dataSource === 'mock'
    ? Promise.resolve(defaultMockCategories)
    : apiGet<CategoryResponse[]>(endpoints.categories)
}
