import { Prisma, PrismaClient } from '@prisma/client'
import { hash } from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  const data: Prisma.UserCreateInput = {
    username: 'superadmin',
    password: 'Superadmin1#',
    email: 'superadmin@email.com',
    fullname: 'Super Admin',
    groups: ['ADMIN', 'SUPERADMIN'],
  }

  await prisma.user
    .create({
      data: { ...data, password: await hash(data.password, 10) },
    })
    .then((superadmin) => {
      console.info({
        ...superadmin,
        rawPassword: data.password,
        hashedPassword: superadmin.password,
      })
    })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
