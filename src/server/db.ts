import 'server-only'
import { PrismaClient } from '@prisma/client'

// Single Prisma client per runtime. On Vercel each warm lambda reuses this
// module-level instance across invocations; connection pooling is handled by
// the Neon -pooler (PgBouncer) endpoint in DATABASE_URL, so we never open more
// than one pool per instance. The global cache exists only to survive Next.js
// HMR in development — without it every hot reload would leak a new client.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ log: ['error'] })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
