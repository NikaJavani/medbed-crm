import { z } from 'zod'

export const createOrganizationSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.enum(['hospital', 'vendor']),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  contractTier: z.enum(['basic', 'premium', 'enterprise']).default('basic'),
  contractExpiry: z.string().datetime().optional(),
})

export const updateOrganizationSchema = createOrganizationSchema.partial()

export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>
export type UpdateOrganizationInput = z.infer<typeof updateOrganizationSchema>