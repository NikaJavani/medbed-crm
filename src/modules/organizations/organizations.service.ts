import { prisma } from '../../lib/prisma'
import { CreateOrganizationInput, UpdateOrganizationInput } from './organizations.schema'

export const getAllOrganizations = async () => {
  return prisma.organization.findMany({
    where: { isActive: true },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      type: true,
      city: true,
      country: true,
      contractTier: true,
      contractExpiry: true,
      isActive: true,
      createdAt: true,
      _count: {
        select: {
          users: true,
          assets: true,
          tickets: true,
        },
      },
    },
  })
}

export const getOrganizationById = async (id: string) => {
  const org = await prisma.organization.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          users: true,
          assets: true,
          tickets: true,
        },
      },
    },
  })

  if (!org) throw new Error('Organization not found')
  return org
}

export const createOrganization = async (data: CreateOrganizationInput) => {
  return prisma.organization.create({
    data: {
      ...data,
      contractExpiry: data.contractExpiry
        ? new Date(data.contractExpiry)
        : undefined,
    },
  })
}

export const updateOrganization = async (
  id: string,
  data: UpdateOrganizationInput
) => {
  const existing = await prisma.organization.findUnique({ where: { id } })
  if (!existing) throw new Error('Organization not found')

  return prisma.organization.update({
    where: { id },
    data: {
      ...data,
      contractExpiry: data.contractExpiry
        ? new Date(data.contractExpiry)
        : undefined,
    },
  })
}

export const deactivateOrganization = async (id: string) => {
  const existing = await prisma.organization.findUnique({ where: { id } })
  if (!existing) throw new Error('Organization not found')

  return prisma.organization.update({
    where: { id },
    data: { isActive: false },
  })
}