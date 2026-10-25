import { apiGet } from '../../../lib/api/client'
import { endpoints } from '../../../lib/api/endpoints'
import type { Book } from '../../../types'

export function getBooks(): Promise<Book[]> {
  return apiGet<Book[]>(endpoints.books)
}
