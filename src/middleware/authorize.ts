import { Response, NextFunction } from 'express'
import { AuthRequest } from './authenticate'

export const authorize = (...allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' })
      return
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ message: 'You do not have permission to do this' })
      return
    }

    next()
  }
}