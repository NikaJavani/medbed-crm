import { Router } from 'express'
import { register, login } from './auth.controller'

const router = Router()

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [firstName, lastName, email, password, role, organizationId]
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: Ahmad
 *               lastName:
 *                 type: string
 *                 example: Razali
 *               email:
 *                 type: string
 *                 example: ahmad@medbed.com
 *               password:
 *                 type: string
 *                 example: password123
 *               role:
 *                 type: string
 *                 enum: [hospital_staff, hospital_admin, technician, manager, vendor_admin]
 *               organizationId:
 *                 type: string
 *                 example: 00000000-0000-0000-0000-000000000001
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error or email already in use
 */
router.post('/register', register)

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login and get JWT tokens
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 example: admin@medbed.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: Login successful — returns accessToken and refreshToken
 *       400:
 *         description: Invalid credentials
 */
router.post('/login', login)

export default router