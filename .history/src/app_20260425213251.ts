import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()

import authRoutes from './modules/auth/auth.routes'

import { errorHandler } from './middleware/errorHandler'

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

// Error handler — must be last
app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})