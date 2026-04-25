import { z } from 'zod'

export const registerSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  phone: z.string().optional(),
  organizationId: z.string().uuid('Invalid organization ID'),
  role: z.enum([
    'hospital_staff',
    'hospital_admin',
    'technician',
    'manager',
    'vendor_admin',
  ]),
})

export const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>