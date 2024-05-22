/* eslint-disable @typescript-eslint/ban-ts-comment */
import { PrismaClient, UserCreationStrategy, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const result = await prisma.$runCommandRaw({
    update: 'User',
    updates: [
      {
        q: { roles: { $exists: false } },
        u: { $set: { roles: ['CUSTOMER'] } },
        multi: true,
        upsert: false,
      },
    ],
  });
  const adminUser = await prisma.user.findFirst({
    where: {
      email: 'scadmin@xsolla.com',
    },
  });
  if (adminUser) {
    const createAdmin = await prisma.user.update({
      where: {
        id: adminUser.id,
      },
      data: {
        roles: ['ADMIN'],
      },
    });
    console.log(createAdmin);
  } else {
    const userDto = {
      email: 'scadmin@xsolla.com',
      createdBy: UserCreationStrategy.EMAIL,
      roles: [UserRole.ADMIN],
    };
    const createdAdminUser = await prisma.user.create({ data: userDto });
    console.log(createdAdminUser);
  }
  console.log(result);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect);
