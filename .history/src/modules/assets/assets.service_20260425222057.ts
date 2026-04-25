import { prisma } from '../../lib/prisma'
import {
  CreateAssetModelInput,
  CreateAssetInput,
  UpdateAssetInput,
} from './assets.schema'

// ── Asset Models ──────────────────────────────────────────

export const getAllAssetModels = async () => {
  return prisma.assetModel.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: { select: { assets: true } },
    },
  })
}

export const createAssetModel = async (data: CreateAssetModelInput) => {
  return prisma.assetModel.create({
    data: {
      name: data.name,
      manufacturer: data.manufacturer,
      category: data.category,
      manualUrl: data.manualUrl,
      specifications: data.specifications
        ? JSON.parse(JSON.stringify(data.specifications))
        : undefined,
    },
  })
}

// ── Assets ────────────────────────────────────────────────

export const getAllAssets = async (organizationId?: string) => {
  return prisma.asset.findMany({
    where: {
      deletedAt: null,
      ...(organizationId ? { organizationId } : {}),
    },
    orderBy: { createdAt: 'desc' },
    include: {
      assetModel: {
        select: { id: true, name: true, manufacturer: true, category: true },
      },
      organization: {
        select: { id: true, name: true },
      },
      _count: {
        select: { tickets: true },
      },
    },
  })
}

export const getAssetById = async (id: string) => {
  const asset = await prisma.asset.findFirst({
    where: { id, deletedAt: null },
    include: {
      assetModel: true,
      organization: {
        select: { id: true, name: true, city: true },
      },
      tickets: {
        where: { deletedAt: null },
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          ticketNumber: true,
          title: true,
          status: true,
          priority: true,
          createdAt: true,
        },
      },
    },
  })

  if (!asset) throw new Error('Asset not found')
  return asset
}

export const createAsset = async (data: CreateAssetInput) => {
  // Check serial number is unique
  const existing = await prisma.asset.findUnique({
    where: { serialNumber: data.serialNumber },
  })
  if (existing) throw new Error('Serial number already exists')

  return prisma.asset.create({
    data: {
      ...data,
      installationDate: data.installationDate
        ? new Date(data.installationDate)
        : undefined,
      warrantyExpiry: data.warrantyExpiry
        ? new Date(data.warrantyExpiry)
        : undefined,
    },
    include: {
      assetModel: {
        select: { id: true, name: true, manufacturer: true },
      },
      organization: {
        select: { id: true, name: true },
      },
    },
  })
}

export const updateAsset = async (id: string, data: UpdateAssetInput) => {
  const existing = await prisma.asset.findFirst({
    where: { id, deletedAt: null },
  })
  if (!existing) throw new Error('Asset not found')

  return prisma.asset.update({
    where: { id },
    data: {
      ...data,
      warrantyExpiry: data.warrantyExpiry
        ? new Date(data.warrantyExpiry)
        : undefined,
    },
  })
}

export const deleteAsset = async (id: string) => {
  const existing = await prisma.asset.findFirst({
    where: { id, deletedAt: null },
  })
  if (!existing) throw new Error('Asset not found')

  // Soft delete
  return prisma.asset.update({
    where: { id },
    data: { deletedAt: new Date() },
  })
}