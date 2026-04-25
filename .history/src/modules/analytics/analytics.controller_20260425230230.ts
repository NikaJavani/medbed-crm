import { Response, NextFunction } from 'express'
import { AuthRequest } from '../../middleware/authenticate'
import {
  getTicketSummary,
  getTicketsByCategory,
  getTicketsByPriority,
  getAssetHealth,
  getTechnicianPerformance,
  getOrganizationSummary,
  getRecentActivity,
} from './analytics.service'

const getOrgFilter = (req: AuthRequest) => {
  const isVendorSide =
    req.user?.role === 'vendor_admin' || req.user?.role === 'manager'
  return isVendorSide
    ? (req.query.organizationId as string | undefined)
    : req.user?.organizationId
}

export const ticketSummary = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = await getTicketSummary(getOrgFilter(req))
    res.json({ data })
  } catch (err) {
    next(err)
  }
}

export const ticketsByCategory = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = await getTicketsByCategory(getOrgFilter(req))
    res.json({ data })
  } catch (err) {
    next(err)
  }
}

export const ticketsByPriority = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = await getTicketsByPriority(getOrgFilter(req))
    res.json({ data })
  } catch (err) {
    next(err)
  }
}

export const assetHealth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = await getAssetHealth(getOrgFilter(req))
    res.json({ data })
  } catch (err) {
    next(err)
  }
}

export const technicianPerformance = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = await getTechnicianPerformance()
    res.json({ data })
  } catch (err) {
    next(err)
  }
}

export const organizationSummary = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = await getOrganizationSummary()
    res.json({ data })
  } catch (err) {
    next(err)
  }
}

export const recentActivity = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = await getRecentActivity(getOrgFilter(req))
    res.json({ data })
  } catch (err) {
    next(err)
  }
}