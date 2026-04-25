import { prisma } from '../../lib/prisma'
import {
  CreateTicketInput,
  UpdateTicketStatusInput,
  AssignTicketInput,
  AddCommentInput,
  CreateServiceReportInput,
} from './tickets.schema'

// ── Helpers ───────────────────────────────────────────────

const generateTicketNumber = async (): Promise<string> => {
  const year = new Date().getFullYear()
  const count = await prisma.ticket.count()
  const padded = String(count + 1).padStart(5, '0')
  return `TKT-${year}-${padded}`
}

const calculateSlaDeadline = (contractTier: string): Date => {
  const now = new Date()
  // basic: 24 hours, premium: 8 hours, enterprise: 4 hours
  const hoursMap: Record<string, number> = {
    basic: 24,
    premium: 8,
    enterprise: 4,
  }
  const hours = hoursMap[contractTier] ?? 24
  return new Date(now.getTime() + hours * 60 * 60 * 1000)
}

// ── Tickets ───────────────────────────────────────────────

export const getAllTickets = async (
  organizationId?: string,
  role?: string
) => {
  return prisma.ticket.findMany({
    where: {
      deletedAt: null,
      ...(organizationId ? { organizationId } : {}),
    },
    orderBy: { createdAt: 'desc' },
    include: {
      asset: {
        select: {
          id: true,
          serialNumber: true,
          ward: true,
          assetModel: { select: { name: true } },
        },
      },
      organization: { select: { id: true, name: true } },
      reportedBy: {
        select: { id: true, firstName: true, lastName: true },
      },
      assignments: {
        where: { isActive: true },
        include: {
          technician: {
            select: { id: true, firstName: true, lastName: true },
          },
        },
      },
    },
  })
}

export const getTicketById = async (id: string, userId?: string, role?: string) => {
  const ticket = await prisma.ticket.findFirst({
    where: { id, deletedAt: null },
    include: {
      asset: {
        include: {
          assetModel: true,
        },
      },
      organization: { select: { id: true, name: true, contractTier: true } },
      reportedBy: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
      statusHistory: {
        orderBy: { changedAt: 'asc' },
        include: {
          changedBy: {
            select: { id: true, firstName: true, lastName: true },
          },
        },
      },
      comments: {
        where: {
          // hospital staff cannot see internal comments
          ...(role === 'hospital_staff' || role === 'hospital_admin'
            ? { isInternal: false }
            : {}),
        },
        orderBy: { createdAt: 'asc' },
        include: {
          author: {
            select: { id: true, firstName: true, lastName: true, role: true },
          },
        },
      },
      assignments: {
        orderBy: { assignedAt: 'desc' },
        include: {
          technician: {
            select: { id: true, firstName: true, lastName: true, phone: true },
          },
          assignedBy: {
            select: { id: true, firstName: true, lastName: true },
          },
        },
      },
    },
  })

  if (!ticket) throw new Error('Ticket not found')
  return ticket
}

export const createTicket = async (
  data: CreateTicketInput,
  reportedById: string,
  organizationId: string
) => {
  // Get the asset to verify it belongs to the organization
  const asset = await prisma.asset.findFirst({
    where: { id: data.assetId, organizationId, deletedAt: null },
  })
  if (!asset) throw new Error('Asset not found or does not belong to your organization')

  // Get organization for SLA calculation
  const organization = await prisma.organization.findUnique({
    where: { id: organizationId },
  })
  if (!organization) throw new Error('Organization not found')

  const ticketNumber = await generateTicketNumber()
  const slaDeadline = calculateSlaDeadline(organization.contractTier)

  const ticket = await prisma.ticket.create({
    data: {
      ticketNumber,
      organizationId,
      assetId: data.assetId,
      reportedById,
      title: data.title,
      description: data.description,
      priority: data.priority,
      category: data.category,
      slaDeadline,
    },
    include: {
      asset: {
        select: { id: true, serialNumber: true, ward: true },
      },
      organization: { select: { id: true, name: true } },
    },
  })

  // Log initial status in history
  await prisma.ticketStatusHistory.create({
    data: {
      ticketId: ticket.id,
      changedById: reportedById,
      oldStatus: 'open',
      newStatus: 'open',
      note: 'Ticket created',
    },
  })

  return ticket
}

export const updateTicketStatus = async (
  id: string,
  data: UpdateTicketStatusInput,
  userId: string
) => {
  const ticket = await prisma.ticket.findFirst({
    where: { id, deletedAt: null },
  })
  if (!ticket) throw new Error('Ticket not found')

  const oldStatus = ticket.status

  const updated = await prisma.ticket.update({
    where: { id },
    data: {
      status: data.status,
      resolvedAt: data.status === 'resolved' ? new Date() : undefined,
      closedAt: data.status === 'closed' ? new Date() : undefined,
    },
  })

  // Always log the status change
  await prisma.ticketStatusHistory.create({
    data: {
      ticketId: id,
      changedById: userId,
      oldStatus,
      newStatus: data.status,
      note: data.note,
    },
  })

  // Update asset status based on ticket
  if (data.status === 'in_progress') {
    await prisma.asset.update({
      where: { id: ticket.assetId },
      data: { status: 'under_maintenance' },
    })
  } else if (data.status === 'resolved' || data.status === 'closed') {
    await prisma.asset.update({
      where: { id: ticket.assetId },
      data: { status: 'operational', lastServicedAt: new Date() },
    })
  }

  return updated
}

export const assignTechnician = async (
  ticketId: string,
  data: AssignTicketInput,
  assignedById: string
) => {
  const ticket = await prisma.ticket.findFirst({
    where: { id: ticketId, deletedAt: null },
  })
  if (!ticket) throw new Error('Ticket not found')

  const technician = await prisma.user.findFirst({
    where: { id: data.technicianId, role: 'technician', isActive: true },
  })
  if (!technician) throw new Error('Technician not found')

  // Deactivate previous assignments
  await prisma.ticketAssignment.updateMany({
    where: { ticketId, isActive: true },
    data: { isActive: false },
  })

  // Create new assignment
  const assignment = await prisma.ticketAssignment.create({
    data: {
      ticketId,
      technicianId: data.technicianId,
      assignedById,
      eta: data.eta ? new Date(data.eta) : undefined,
    },
    include: {
      technician: {
        select: { id: true, firstName: true, lastName: true, phone: true },
      },
    },
  })

  // Auto-acknowledge the ticket
  await updateTicketStatus(
    ticketId,
    { status: 'acknowledged', note: `Assigned to ${technician.firstName} ${technician.lastName}` },
    assignedById
  )

  return assignment
}

export const addComment = async (
  ticketId: string,
  data: AddCommentInput,
  authorId: string
) => {
  const ticket = await prisma.ticket.findFirst({
    where: { id: ticketId, deletedAt: null },
  })
  if (!ticket) throw new Error('Ticket not found')

  return prisma.ticketComment.create({
    data: {
      ticketId,
      authorId,
      body: data.body,
      isInternal: data.isInternal,
    },
    include: {
      author: {
        select: { id: true, firstName: true, lastName: true, role: true },
      },
    },
  })
}

export const createServiceReport = async (
  ticketId: string,
  data: CreateServiceReportInput,
  technicianId: string
) => {
  const ticket = await prisma.ticket.findFirst({
    where: { id: ticketId, deletedAt: null },
  })
  if (!ticket) throw new Error('Ticket not found')

  const existing = await prisma.serviceReport.findUnique({
    where: { ticketId },
  })
  if (existing) throw new Error('Service report already exists for this ticket')

  const { partsUsed, ...reportData } = data

  const report = await prisma.serviceReport.create({
    data: {
      ticketId,
      technicianId,
      diagnosis: reportData.diagnosis,
      workPerformed: reportData.workPerformed,
      rootCause: reportData.rootCause,
      visitStart: new Date(reportData.visitStart),
      visitEnd: new Date(reportData.visitEnd),
      laborMinutes: reportData.laborMinutes,
      requiresFollowup: reportData.requiresFollowup,
      followupNotes: reportData.followupNotes,
      partsUsed: {
        create: partsUsed.map((part) => ({
          partNumber: part.partNumber,
          partName: part.partName,
          quantity: part.quantity,
          unitCost: part.unitCost,
          currency: part.currency,
        })),
      },
    },
    include: {
      partsUsed: true,
    },
  })

  // Auto-resolve the ticket when report is submitted
  await updateTicketStatus(
    ticketId,
    { status: 'resolved', note: 'Service report submitted' },
    technicianId
  )

  return report
}