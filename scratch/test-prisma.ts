import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Available models:', Object.keys(prisma).filter(k => !k.startsWith('_')));
  console.log('ConflictForecast exists:', !!prisma.conflictForecast);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
