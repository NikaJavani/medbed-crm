import { Response, NextFunction } from 'express'
import { AuthRequest } from '../../middleware/authenticate'
import {
  getAllOrganizations,
  getOrganizationById,
  createOrganization,
  updateOrganization,
  deactivateOrganization,
} from './organizations.service'
import {
  createOrganizationSchema,
  updateOrganizationSchema,
} from './organizations.schema'

export const getAll = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const orgs = await getAllOrganizations()
    res.json({ data: orgs })
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
    const org = await getOrganizationById(req.params.id as string)
    res.json({ data: org })
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
    const parsed = createOrganizationSchema.safeParse(req.body)
    if (!parsed.success) {
      res.status(400).json({ errors: parsed.error.flatten().fieldErrors })
      return
    }

    const org = await createOrganization(parsed.data)
    res.status(201).json({ message: 'Organization created', data: org })
  } catch (err) {
    next(err)
  }
}

export const update = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const parsed = updateOrganizationSchema.safeParse(req.body)
    if (!parsed.success) {
      res.status(400).json({ errors: parsed.error.flatten().fieldErrors })
      return
    }

    const org = await updateOrganization(req.params.id as string, parsed.data)
    res.status(200).json({ message: 'Organization updated', data: org })
  } catch (err) {
    next(err)
  }
}

export const deactivate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await deactivateOrganization(req.params.id)
    res.json({ message: 'Organization deactivated' })
  } catch (err) {
    next(err)
  }
}