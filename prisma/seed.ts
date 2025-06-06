import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../lib/auth';

const prisma = new PrismaClient();

async function main() {
  // Hash the default password using our custom hashPassword function
  const hashedPassword = await hashPassword('admin123');

  // Create default admin if it doesn't exist
  const admin = await prisma.admin.upsert({
    where: {
      email: 'admin@example.com',
    },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'admin',
    },
  });

  console.log('Default admin created:', admin);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 