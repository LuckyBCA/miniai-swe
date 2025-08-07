import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { 
    prisma: PrismaClient
}

// Check if we're in a dev environment without a DATABASE_URL
const isDev = process.env.NODE_ENV !== 'production';
const hasDbUrl = !!process.env.DATABASE_URL;

let prisma: PrismaClient;

if (!hasDbUrl && isDev) {
  // Create a mock PrismaClient for development without database
  console.warn('No DATABASE_URL found, using mock Prisma client for development');
  prisma = {
    user: {
      findUnique: async () => null,
      findMany: async () => [],
      create: async () => ({ id: 'mock-id' }),
      update: async () => ({ id: 'mock-id' }),
      delete: async () => ({ id: 'mock-id' }),
    },
    vibe: {
      findUnique: async () => null,
      findMany: async () => [],
      create: async (data: any) => ({ 
        id: 'mock-vibe-id', 
        ...data.data,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
      update: async (params: any) => ({ 
        id: params.where.id, 
        ...params.data,
        updatedAt: new Date(),
      }),
      delete: async () => ({ id: 'mock-id' }),
    },
    sandboxPreview: {
      findUnique: async () => null,
      findMany: async () => [],
      create: async () => ({ id: 'mock-id' }),
      update: async () => ({ id: 'mock-id' }),
      delete: async () => ({ id: 'mock-id' }),
    },
    creditUsage: {
      findUnique: async () => null,
      findMany: async () => [],
      create: async () => ({ id: 'mock-id' }),
      update: async () => ({ id: 'mock-id' }),
      delete: async () => ({ id: 'mock-id' }),
    },
    $connect: async () => {},
    $disconnect: async () => {},
  } as any;
} else {
  prisma = globalForPrisma.prisma || new PrismaClient()
}

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma