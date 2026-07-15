import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// config.ts lives at <root>/server/src/config.ts
export const REPO_ROOT = path.resolve(__dirname, '..', '..')
export const ENV_PATH = path.join(REPO_ROOT, '.env')

export const PORT = Number(process.env.PORT ?? 4000)
export const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret-change-me'
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? '7d'
