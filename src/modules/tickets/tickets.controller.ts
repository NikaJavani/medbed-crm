import { Response, NextFunction } from 'express'
import { AuthRequest } from '../../middleware/authenticate'
import {
  getAllTickets,
  getTicketById,
  createTicket,
  updateTicketStatus,
  assignTechnician,
  addComment,
  createServiceReport,
} from './tickets.service'
import {
  createTicketSchema,
  updateTicketStatusSchema,
  assignTicketSchema,
  addCommentSchema,
  createServiceReportSchema,
} from './tickets.schema'

export const getAll = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const isVendorSide =
      req.user?.role === 'vendor_admin' || req.user?.role === 'manager'

    const organizationId = isVendorSide
      ? (req.query.organizationId as string | undefined)
      : req.user?.organizationId

    const tickets = await getAllTickets(organizationId, req.user?.role)
    res.json({ data: tickets })
  } catch (err) {
    next(err)
  }
}

export const getById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const ticket = await getTicketById(
      req.params.id as string,
      req.user?.userId,
      req.user?.role
    )
    res.json({ data: ticket })
  } catch (err) {
    next(err)
  }
}

export const create = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const parsed = createTicketSchema.safeParse(req.body)
    if (!parsed.success) {
      res.status(400).json({ errors: parsed.error.flatten().fieldErrors })
      return
    }

    const ticket = await createTicket(
      parsed.data,
      req.user!.userId,
      req.user!.organizationId
    )
    res.status(201).json({ message: 'Ticket created', data: ticket })
  } catch (err) {
    next(err)
  }
}

export const updateStatus = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const parsed = updateTicketStatusSchema.safeParse(req.body)
    if (!parsed.success) {
      res.status(400).json({ errors: parsed.error.flatten().fieldErrors })
      return
    }

    const ticket = await updateTicketStatus(
      req.params.id as string,
      parsed.data,
      req.user!.userId
    )
    res.json({ message: 'Ticket status updated', data: ticket })
  } catch (err) {
    next(err)
  }
}

export const assign = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const parsed = assignTicketSchema.safeParse(req.body)
    if (!parsed.success) {
      res.status(400).json({ errors: parsed.error.flatten().fieldErrors })
      return
    }

    const assignment = await assignTechnician(
      req.params.id as string,
      parsed.data,
      req.user!.userId
    )
    res.json({ message: 'Technician assigned', data: assignment })
  } catch (err) {
    next(err)
  }
}

export const comment = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const parsed = addCommentSchema.safeParse(req.body)
    if (!parsed.success) {
      res.status(400).json({ errors: parsed.error.flatten().fieldErrors })
      return
    }

    const result = await addComment(
      req.params.id as string,
      parsed.data,
      req.user!.userId
    )
    res.status(201).json({ message: 'Comment added', data: result })
  } catch (err) {
    next(err)
  }
}

export const submitServiceReport = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const parsed = createServiceReportSchema.safeParse(req.body)
    if (!parsed.success) {
      res.status(400).json({ errors: parsed.error.flatten().fieldErrors })
      return
    }

    const report = await createServiceReport(
      req.params.id as string,
      parsed.data,
      req.user!.userId
    )
    res.status(201).json({ message: 'Service report submitted', data: report })
  } catch (err) {
    next(err)
  }
}