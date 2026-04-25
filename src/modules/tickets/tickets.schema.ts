import { z } from 'zod'

export const createTicketSchema = z.object({
  assetId: z.string().min(1, 'Asset ID is required'),
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  category: z.enum([
    'mechanical',
    'electrical',
    'software',
    'preventive_maintenance',
    'other',
  ]).default('other'),
})

export const updateTicketStatusSchema = z.object({
  status: z.enum([
    'open',
    'acknowledged',
    'in_progress',
    'pending_parts',
    'resolved',
    'closed',
    'cancelled',
  ]),
  note: z.string().optional(),
})

export const assignTicketSchema = z.object({
  technicianId: z.string().min(1, 'Technician ID is required'),
  eta: z.string().datetime().optional(),
})

export const addCommentSchema = z.object({
  body: z.string().min(1, 'Comment cannot be empty'),
  isInternal: z.boolean().default(false),
})

export const createServiceReportSchema = z.object({
  diagnosis: z.string().min(1, 'Diagnosis is required'),
  workPerformed: z.string().min(1, 'Work performed is required'),
  rootCause: z.enum([
    'hardware_failure',
    'user_error',
    'software_bug',
    'wear_and_tear',
    'other',
  ]),
  visitStart: z.string().datetime(),
  visitEnd: z.string().datetime(),
  laborMinutes: z.number().int().min(0).default(0),
  requiresFollowup: z.boolean().default(false),
  followupNotes: z.string().optional(),
  partsUsed: z.array(z.object({
    partNumber: z.string().optional(),
    partName: z.string().min(1),
    quantity: z.number().int().min(1),
    unitCost: z.number().min(0),
    currency: z.string().default('MYR'),
  })).default([]),
})

export type CreateTicketInput = z.infer<typeof createTicketSchema>
export type UpdateTicketStatusInput = z.infer<typeof updateTicketStatusSchema>
export type AssignTicketInput = z.infer<typeof assignTicketSchema>
export type AddCommentInput = z.infer<typeof addCommentSchema>
export type CreateServiceReportInput = z.infer<typeof createServiceReportSchema>