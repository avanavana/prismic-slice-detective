import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN
})

const DEFAULT_TTL = 60 * 60 // 1 hour in seconds

export async function getCachedData<T>(key: string): Promise<T | null> {
  try {
    const data = await redis.get(key)
    if (!data) return null
    
    return typeof data === 'string' ? JSON.parse(data) as T : data as T
  } catch {
    return null
  }
}

export async function setCachedData<T>(
  key: string, 
  data: T, 
  { ttl = DEFAULT_TTL }: { ttl?: number } = {}
): Promise<void> {
  await redis.set(key, JSON.stringify(data), { ex: ttl })
}

export async function deleteCachedData(key: string): Promise<void> {
  await redis.del(key)
}