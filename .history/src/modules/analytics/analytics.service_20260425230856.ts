import { prisma } from '../../lib/prisma'

export const getTicketSummary = async (organizationId?: string) => {
  const where = {
    deletedAt: null,
    ...(organizationId ? { organizationId } : {}),
  }

  const [
    total,
    open,
    inProgress,
    pendingParts,
    resolved,
    closed,
    critical,
    breachedSla,
  ] = await Promise.all([
    prisma.ticket.count({ where }),
    prisma.ticket.count({ where: { ...where, status: 'open' } }),
    prisma.ticket.count({ where: { ...where, status: 'in_progress' } }),
    prisma.ticket.count({ where: { ...where, status: 'pending_parts' } }),
    prisma.ticket.count({ where: { ...where, status: 'resolved' } }),
    prisma.ticket.count({ where: { ...where, status: 'closed' } }),
    prisma.ticket.count({ where: { ...where, priority: 'critical' } }),
    prisma.ticket.count({
      where: {
        ...where,
        slaDeadline: { lt: new Date() },
        status: { notIn: ['resolved', 'closed', 'cancelled'] },
      },
    }),
  ])

  const activeTickets = open + inProgress + pendingParts
  const slaComplianceRate =
    total > 0
      ? (((total - breachedSla) / total) * 100).toFixed(1)
      : '100.0'

  return {
    total,
    byStatus: { open, inProgress, pendingParts, resolved, closed },
    critical,
    breachedSla,
    activeTickets,
    slaComplianceRate: `${slaComplianceRate}%`,
  }
}

export const getTicketsByCategory = async (organizationId?: string) => {
  const where = {
    deletedAt: null,
    ...(organizationId ? { organizationId } : {}),
  }

  const results = await prisma.ticket.groupBy({
    by: ['category'],
    where,
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
  })

  return results.map((r) => ({
    category: r.category,
    count: r._count.id,
  }))
}

export const getTicketsByPriority = async (organizationId?: string) => {
  const where = {
    deletedAt: null,
    ...(organizationId ? { organizationId } : {}),
  }

  const results = await prisma.ticket.groupBy({
    by: ['priority'],
    where,
    _count: { id: true },
  })

  return results.map((r) => ({
    priority: r.priority,
    count: r._count.id,
  }))
}

export const getAssetHealth = async (organizationId?: string) => {
  // Assets with the most tickets — potential replacement candidates
  const assets = await prisma.asset.findMany({
    where: {
      deletedAt: null,
      ...(organizationId ? { organizationId } : {}),
    },
    include: {
      assetModel: { select: { name: true, category: true } },
      organization: { select: { name: true } },
      _count: { select: { tickets: true } },
    },
    orderBy: {
      tickets: { _count: 'desc' },
    },
    take: 10,
  })

  return assets.map((a) => ({
    id: a.id,
    serialNumber: a.serialNumber,
    internalTag: a.internalTag,
    ward: a.ward,
    status: a.status,
    model: a.assetModel.name,
    category: a.assetModel.category,
    organization: a.organization.name,
    totalTickets: a._count.tickets,
    healthScore:
      a._count.tickets === 0
        ? 'Excellent'
        : a._count.tickets <= 2
        ? 'Good'
        : a._count.tickets <= 4
        ? 'Fair'
        : 'Poor',
  }))
}

export const getTechnicianPerformance = async () => {
  const technicians = await prisma.user.findMany({
    where: { role: 'technician', isActive: true },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      assignments: {
        where: { isActive: true },
        select: { ticketId: true },
      },
      serviceReports: {
        select: {
          laborMinutes: true,
          createdAt: true,
          ticketId: true,
        },
      },
    },
  })

  return technicians.map((tech) => {
    const totalReports = tech.serviceReports.length
    const avgLaborMinutes =
      totalReports > 0
        ? Math.round(
            tech.serviceReports.reduce((sum, r) => sum + r.laborMinutes, 0) /
              totalReports
          )
        : 0

    const avgResolutionHours = null

    return {
      id: tech.id,
      name: `${tech.firstName} ${tech.lastName}`,
      activeAssignments: tech.assignments.length,
      ticketsResolved: totalReports,
      avgLaborMinutes,
      avgResolutionHours: avgResolutionHours ? `${avgResolutionHours}h` : 'N/A',
    }
  })
}

export const getOrganizationSummary = async () => {
  const organizations = await prisma.organization.findMany({
    where: { isActive: true, type: 'hospital' },
    include: {
      _count: {
        select: { tickets: true, assets: true, users: true },
      },
    },
  })

  const withStats = await Promise.all(
    organizations.map(async (org) => {
      const openTickets = await prisma.ticket.count({
        where: {
          organizationId: org.id,
          deletedAt: null,
          status: { notIn: ['resolved', 'closed', 'cancelled'] },
        },
      })

      const breachedSla = await prisma.ticket.count({
        where: {
          organizationId: org.id,
          deletedAt: null,
          slaDeadline: { lt: new Date() },
          status: { notIn: ['resolved', 'closed', 'cancelled'] },
        },
      })

      return {
        id: org.id,
        name: org.name,
        city: org.city,
        contractTier: org.contractTier,
        totalAssets: org._count.assets,
        totalTickets: org._count.tickets,
        openTickets,
        breachedSla,
      }
    })
  )

  return withStats
}

export const getRecentActivity = async (organizationId?: string) => {
  const where = {
    deletedAt: null,
    ...(organizationId ? { organizationId } : {}),
  }

  const recentTickets = await prisma.ticket.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: {
      id: true,
      ticketNumber: true,
      title: true,
      status: true,
      priority: true,
      createdAt: true,
      organization: { select: { name: true } },
      asset: { select: { serialNumber: true, ward: true } },
    },
  })

  const recentStatusChanges = await prisma.ticketStatusHistory.findMany({
    orderBy: { changedAt: 'desc' },
    take: 5,
    include: {
      ticket: {
        select: {
          ticketNumber: true,
          organizationId: true,
        },
      },
      changedBy: {
        select: { firstName: true, lastName: true, role: true },
      },
    },
    ...(organizationId
      ? {
          where: {
            ticket: { organizationId },
          },
        }
      : {}),
  })

  return {
    recentTickets,
    recentStatusChanges: recentStatusChanges.map((s) => ({
      ticketNumber: s.ticket.ticketNumber,
      from: s.oldStatus,
      to: s.newStatus,
      by: `${s.changedBy.firstName} ${s.changedBy.lastName}`,
      role: s.changedBy.role,
      note: s.note,
      at: s.changedAt,
    })),
  }
}