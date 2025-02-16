import fs from 'fs'
import path from 'path'
import Database from 'better-sqlite3'

const DB_PATH = process.env.CACHE_DB_PATH || path.join(process.cwd(), 'data/db/cache.db')
const DB_DIR = path.dirname(DB_PATH)

if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true })

const cacheGlobal = globalThis as unknown as { cache?: InstanceType<typeof Database> }

if (!cacheGlobal.cache) cacheGlobal.cache = new Database(DB_PATH)

const cache = cacheGlobal.cache

cache.exec(`
  CREATE TABLE IF NOT EXISTS cache (
    key TEXT PRIMARY KEY,
    value TEXT,
    expires_at INTEGER
  )
`)

export default cache