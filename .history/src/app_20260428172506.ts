import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'

dotenv.config()

import { validateEnv } from './lib/env'
import authRoutes from './modules/auth/auth.routes'
import organizationRoutes from './modules/organizations/organizations.routes'
import userRoutes from './modules/users/users.routes'
import assetRoutes from './modules/assets/assets.routes'
import ticketRoutes from './modules/tickets/tickets.routes'
import analyticsRoutes from './modules/analytics/analytics.routes'
import { errorHandler } from './middleware/errorHandler'
import swaggerUi from 'swagger-ui-express'
import { swaggerSpec } from './lib/swagger'

// Validate environment on startup
validateEnv()

const app = express()
const PORT = process.env.PORT || 3000

// ── Security middleware ────────────────────────────────────
app.use(helmet())

// Rate limiting — global
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: { message: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
}))

// Stricter rate limit on auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: 'Too many login attempts, please try again later' },
})

// ── General middleware ─────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
}))
app.use(express.json({ limit: '10mb' }))

// ── Health check ───────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'MedBed CRM API is running',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  })
})

// ── API Documentation ──────────────────────────────────────
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

// ── Routes ─────────────────────────────────────────────────
app.use('/api/auth', authLimiter, authRoutes)
app.use('/api/organizations', organizationRoutes)
app.use('/api/users', userRoutes)
app.use('/api/assets', assetRoutes)
app.use('/api/tickets', ticketRoutes)
app.use('/api/analytics', analyticsRoutes)

// ── Error handler ──────────────────────────────────────────
app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
  console.log(`API Docs: http://localhost:${PORT}/api-docs`)
})