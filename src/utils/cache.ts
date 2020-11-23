import { DateTime } from "luxon";

const VALIDITY = 15000

interface CacheEntry<T extends object> {
  value: T
  validUntil: number
}

const cache: Map<string, CacheEntry<any>> = new Map()

const isEntryValid = <T extends object>(entry: CacheEntry<T>) => {
  return entry.validUntil > DateTime.local().toMillis()
}

export const clearCache = () => {
  cache.clear()
}

export default async <T extends object>(key: string, fetcher: () => Promise<T>): Promise<T> => {
  if (cache.has(key)) {
    const entry = cache.get(key)!!
    if (isEntryValid(entry)) {
      return entry.value
    } else {
      cache.delete(key)
    }
  }
  const result = await fetcher()
  cache.set(key, {
    value: result,
    validUntil: DateTime.local().toMillis() + VALIDITY
  })
  return result
}