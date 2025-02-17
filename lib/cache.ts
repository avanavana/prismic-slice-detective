import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN
})

const DEFAULT_TTL = 60 * 60

export async function getCachedData<T>(key: string): Promise<T | null> {
  const data = await redis.get(key)
  return data ? JSON.parse(data as string) as T : null
}

export async function setCachedData<T>(key: string, data: T, { ttl = DEFAULT_TTL }): Promise<void> {
  await redis.set(key, JSON.stringify(data), { ex: ttl })
}

export async function deleteCachedData(key: string): Promise<void> {
  await redis.del(key)
}