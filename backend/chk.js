const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.appointment.findMany({ include: { professional: true, patient: true } })
  .then(a => console.log(JSON.stringify(a, null, 2)))
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
