import { z } from 'zod'

export const updateUserSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  phone: z.string().optional(),
  role: z.enum([
    'hospital_staff',
    'hospital_admin',
    'technician',
    'manager',
    'vendor_admin',
  ]).optional(),
  isActive: z.boolean().optional(),
})

export type UpdateUserInput = z.infer<typeof updateUserSchema>