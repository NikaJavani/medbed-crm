import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()

import authRoutes from './modules/auth/auth.routes'
import organizationRoutes from './modules/organizations/organizations.routes'
import { errorHandler } from './middleware/errorHandler'
import userRoutes from './modules/users/users.routes'
import assetRoutes from './modules/assets/assets.routes'
import ticketRoutes from './modules/tickets/tickets.routes'

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(cors())
app.use(express.json())

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'MedBed CRM API is running' })
})

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/organizations', organizationRoutes)
app.use('/api/users', userRoutes)
app.use('/api/assets', assetRoutes)
app.use('/api/tickets', ticketRoutes)

// Error handler — must be last
app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})