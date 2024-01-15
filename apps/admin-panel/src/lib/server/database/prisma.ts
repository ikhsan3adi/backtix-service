import { PrismaClient } from '@prisma/client'

const prisma = global.prisma || new PrismaClient()

global.prisma = prisma

export { prisma }
