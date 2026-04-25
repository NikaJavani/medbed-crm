import bcrypt from 'bcryptjs'
import { prisma } from '../../lib/prisma'
import { generateAccessToken, generateRefreshToken } from '../../lib/jwt'
import { RegisterInput, LoginInput } from './auth.schema'

export const registerUser = async (data: RegisterInput) => {
  const existing = await prisma.user.findUnique({
    where: { email: data.email },
  })

  if (existing) {
    throw new Error('Email already in use')
  }

  const passwordHash = await bcrypt.hash(data.password, 12)

  const user = await prisma.user.create({
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      passwordHash,
      phone: data.phone,
      organizationId: data.organizationId,
      role: data.role,
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      organizationId: true,
    },
  })

  return user
}

export const loginUser = async (data: LoginInput) => {
  const user = await prisma.user.findUnique({
    where: { email: data.email },
  })

  if (!user || !user.isActive) {
    throw new Error('Invalid credentials')
  }

  const passwordMatch = await bcrypt.compare(data.password, user.passwordHash)

  if (!passwordMatch) {
    throw new Error('Invalid credentials')
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  })

  const payload = {
    userId: user.id,
    role: user.role,
    organizationId: user.organizationId,
  }

  const accessToken = generateAccessToken(payload)
  const refreshToken = generateRefreshToken(payload)

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
    },
  }
}