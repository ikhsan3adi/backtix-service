import { Prisma, PrismaClient } from '@prisma/client'
import { hash } from 'bcrypt'

const prisma = new PrismaClient()

/**
 * Create initial superadmin & withdrawal fee
 */
async function main() {
  const data: Prisma.UserCreateInput = {
    username: 'superadmin',
    password: 'Superadmin1#',
    email: 'superadmin@email.com',
    fullname: 'Super Admin',
    activated: true,
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

  await prisma.withdrawFee
    .create({ data: { id: 0, amount: 2500 } })
    .then((fee) => console.info(fee))
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
