import { z } from 'zod'

export const createAssetModelSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  manufacturer: z.string().min(1, 'Manufacturer is required'),
  category: z.string().min(1, 'Category is required'),
  specifications: z.record(z.unknown()).optional(),
  manualUrl: z.string().url().optional(),
})

export const createAssetSchema = z.object({
  organizationId: z.string().min(1, 'Organization ID is required'),
  assetModelId: z.string().min(1, 'Asset model ID is required'),
  serialNumber: z.string().min(1, 'Serial number is required'),
  internalTag: z.string().optional(),
  ward: z.string().optional(),
  floor: z.string().optional(),
  installationDate: z.string().datetime().optional(),
  warrantyExpiry: z.string().datetime().optional(),
})

export const updateAssetSchema = z.object({
  internalTag: z.string().optional(),
  ward: z.string().optional(),
  floor: z.string().optional(),
  status: z.enum([
    'operational',
    'under_maintenance',
    'decommissioned',
    'pending_inspection',
  ]).optional(),
  warrantyExpiry: z.string().datetime().optional(),
  metadata: z.record(z.unknown()).optional(),
})

export type CreateAssetModelInput = z.infer<typeof createAssetModelSchema>
export type CreateAssetInput = z.infer<typeof createAssetSchema>
export type UpdateAssetInput = z.infer<typeof updateAssetSchema>