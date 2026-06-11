import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

function getPrismaClient() {
  const connectionString =
    process.env.DATABASE_URL ??
    "postgres://postgres:postgres@localhost:51214/postgres";

  const adapter = new PrismaPg(connectionString);
  const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

  const client = globalForPrisma.prisma ?? new PrismaClient({ adapter });

  if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = client;

  return client;
}

export const prisma = getPrismaClient();
