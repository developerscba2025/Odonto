import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seeding...');

  // Check if admin already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: 'doctor@dentalflow.com' },
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('123456', 10);
    const admin = await prisma.user.create({
      data: {
        name: 'Dr. Administrador',
        email: 'doctor@dentalflow.com',
        passwordHash: hashedPassword,
        role: 'ADMIN',
      },
    });
    console.log(`Created admin user: ${admin.email}`);
  } else {
    console.log('Admin user already exists. Skipping creation.');
  }

  console.log('Seeding finished.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
