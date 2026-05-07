import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.user.findUnique({ where: { email: 'mike.phiri@nearbyescapes.com' } });
  if (existing) {
    console.log('Seed admin already exists. Skipping.');
    return;
  }

  const hashed = await bcrypt.hash('Mike31@nearbyescapes', 10);
  const admin = await prisma.user.create({
    data: {
      email: 'mike.phiri@nearbyescapes.com',
      password: hashed,
      firstName: 'Mike',
      lastName: 'Phiri',
      role: 'ADMIN',
    },
  });

  console.log(`Seed admin created: ${admin.email}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
