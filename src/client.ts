import { PrismaClient } from '../generated/prisma';
import { fieldEncryptionExtension } from 'prisma-field-encryption';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient().$extends(fieldEncryptionExtension());

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma as any;

export default prisma;
