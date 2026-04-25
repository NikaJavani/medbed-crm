import { Router } from 'express'
import { getAll, getById, create, update, deactivate } from './organizations.controller'
import { authenticate } from '../../middleware/authenticate'
import { authorize } from '../../middleware/authorize'

const router = Router()
router.use(authenticate)

/**
 * @swagger
 * /api/organizations:
 *   get:
 *     tags: [Organizations]
 *     summary: Get all organizations
 *     responses:
 *       200:
 *         description: List of organizations
 */
router.get('/', getAll)

/**
 * @swagger
 * /api/organizations/{id}:
 *   get:
 *     tags: [Organizations]
 *     summary: Get organization by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Organization details
 *       404:
 *         description: Not found
 */
router.get('/:id', getById)

/**
 * @swagger
 * /api/organizations:
 *   post:
 *     tags: [Organizations]
 *     summary: Create a new organization (vendor_admin only)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, type]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Hospital Selayang
 *               type:
 *                 type: string
 *                 enum: [hospital, vendor]
 *               city:
 *                 type: string
 *                 example: Selayang
 *               country:
 *                 type: string
 *                 example: Malaysia
 *               contractTier:
 *                 type: string
 *                 enum: [basic, premium, enterprise]
 *     responses:
 *       201:
 *         description: Organization created
 */
router.post('/', authorize('vendor_admin'), create)

/**
 * @swagger
 * /api/organizations/{id}:
 *   patch:
 *     tags: [Organizations]
 *     summary: Update an organization
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Organization updated
 */
router.patch('/:id', authorize('vendor_admin', 'manager'), update)

/**
 * @swagger
 * /api/organizations/{id}:
 *   delete:
 *     tags: [Organizations]
 *     summary: Deactivate an organization (vendor_admin only)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Organization deactivated
 */
router.delete('/:id', authorize('vendor_admin'), deactivate)

export default router