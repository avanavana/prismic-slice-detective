import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN
})

const DEFAULT_TTL = 60 * 60

export async function getCachedData<T>(key: string): Promise<T | null> {
  let data: string | T | null
  
  try {
    data = await redis.get(key)
    if (!data) return null
    if (typeof data === 'string') {
      console.log(`First 10 chars: ${data.slice(0, 10)}`)
    }
    
    return typeof data === 'string' ? JSON.parse(data) as T : data as T
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(`Cache error for key ${key}: ${error.message}`)
    } else {
      console.error(`Cache error for key ${key}: ${String(error)}`)
    }
    return null
  }
}

export async function setCachedData<T>(key: string, data: T, { ttl = DEFAULT_TTL }): Promise<void> {
  await redis.set(key, JSON.stringify(data), { ex: ttl })
}

export async function deleteCachedData(key: string): Promise<void> {
  await redis.del(key)
}