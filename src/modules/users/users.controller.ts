import { Response, NextFunction } from 'express'
import { AuthRequest } from '../../middleware/authenticate'
import {
  getAllUsers,
  getUserById,
  updateUser,
  deactivateUser,
  getTechnicians,
} from './users.service'
import { updateUserSchema } from './users.schema'

export const getAll = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // hospital_admin can only see users in their own organization
    // vendor_admin and manager can see all users
    const isVendorSide =
      req.user?.role === 'vendor_admin' || req.user?.role === 'manager'

    const organizationId = isVendorSide
      ? (req.query.organizationId as string | undefined)
      : req.user?.organizationId

    const users = await getAllUsers(organizationId)
    res.json({ data: users })
  } catch (err) {
    next(err)
  }
}

export const getMe = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await getUserById(req.user!.userId)
    res.json({ data: user })
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
    const user = await getUserById(req.params.id as string)
    res.json({ data: user })
  } catch (err) {
    next(err)
  }
}

export const updateMe = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const parsed = updateUserSchema.safeParse(req.body)
    if (!parsed.success) {
      res.status(400).json({ errors: parsed.error.flatten().fieldErrors })
      return
    }

    // users cannot change their own role
    const { role, isActive, ...safeData } = parsed.data
    const user = await updateUser(req.user!.userId, safeData)
    res.json({ message: 'Profile updated', data: user })
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
    const parsed = updateUserSchema.safeParse(req.body)
    if (!parsed.success) {
      res.status(400).json({ errors: parsed.error.flatten().fieldErrors })
      return
    }

    const user = await updateUser(req.params.id as string, parsed.data)
    res.json({ message: 'User updated', data: user })
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
    await deactivateUser(req.params.id as string)
    res.json({ message: 'User deactivated' })
  } catch (err) {
    next(err)
  }
}

export const listTechnicians = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const technicians = await getTechnicians()
    res.json({ data: technicians })
  } catch (err) {
    next(err)
  }
}