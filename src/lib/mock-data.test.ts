import { beforeEach, describe, expect, it } from 'vitest'
import { defaultMockBooks, MOCK_KEYS } from '../mocks/data'
import { readMockValue, writeMockValue } from '../mocks/storage'

describe('mock domain storage', () => {
  beforeEach(() => window.localStorage.clear())

  it('initializes defaults and preserves empty collections', () => {
    expect(readMockValue(MOCK_KEYS.books, defaultMockBooks)).toHaveLength(3)
    writeMockValue(MOCK_KEYS.books, [])
    expect(readMockValue(MOCK_KEYS.books, defaultMockBooks)).toEqual([])
  })
})
