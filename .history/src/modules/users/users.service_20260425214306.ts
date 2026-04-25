import { prisma } from '../../lib/prisma'
import { UpdateUserInput } from './users.schema'

export const getAllUsers = async (organizationId?: string) => {
  return prisma.user.findMany({
    where: {
      ...(organizationId ? { organizationId } : {}),
      isActive: true,
    },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      phone: true,
      isActive: true,
      lastLoginAt: true,
      createdAt: true,
      organization: {
        select: {
          id: true,
          name: true,
          type: true,
        },
      },
    },
  })
}

export const getUserById = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      phone: true,
      isActive: true,
      lastLoginAt: true,
      createdAt: true,
      organization: {
        select: {
          id: true,
          name: true,
          type: true,
        },
      },
    },
  })

  if (!user) throw new Error('User not found')
  return user
}

export const updateUser = async (id: string, data: UpdateUserInput) => {
  const existing = await prisma.user.findUnique({ where: { id } })
  if (!existing) throw new Error('User not found')

  return prisma.user.update({
    where: { id },
    data,
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      phone: true,
      isActive: true,
    },
  })
}

export const deactivateUser = async (id: string) => {
  const existing = await prisma.user.findUnique({ where: { id } })
  if (!existing) throw new Error('User not found')

  return prisma.user.update({
    where: { id },
    data: { isActive: false },
  })
}

export const getTechnicians = async () => {
  return prisma.user.findMany({
    where: {
      role: 'technician',
      isActive: true,
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      organization: {
        select: { id: true, name: true },
      },
    },
  })
}