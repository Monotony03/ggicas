import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function test() {
  try {
    const conflict = await prisma.conflict.findFirst({
      include: {
        participants: {
          include: {
            country: {
              include: {
                alliancesA: { include: { organization: true } },
                sanctionsIn: { include: { imposingCountry: true } },
                armsImports: {
                  orderBy: { year: 'desc' },
                  take: 2,
                  include: { exporter: true }
                }
              }
            }
          }
        }
      }
    });
    console.log(conflict ? 'Success' : 'Not found');
  } catch (e) {
    console.error('PRISMA ERROR:', e);
  } finally {
    await prisma.$disconnect();
  }
}

test();
