import { Request, Response, NextFunction } from 'express'
import { registerUser, loginUser } from './auth.service'
import { registerSchema, loginSchema } from './auth.schema'

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const parsed = registerSchema.safeParse(req.body)
    if (!parsed.success) {
      res.status(400).json({ errors: parsed.error.flatten().fieldErrors })
      return
    }

    const user = await registerUser(parsed.data)
    res.status(201).json({ message: 'User registered successfully', user })
  } catch (err) {
    next(err)
  }
}

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const parsed = loginSchema.safeParse(req.body)
    if (!parsed.success) {
      res.status(400).json({ errors: parsed.error.flatten().fieldErrors })
      return
    }

    const result = await loginUser(parsed.data)
    res.status(200).json(result)
  } catch (err) {
    next(err)
  }
}