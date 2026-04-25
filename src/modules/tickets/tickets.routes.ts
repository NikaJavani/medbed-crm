import { Router } from 'express'
import {
  getAll, getById, create, updateStatus,
  assign, comment, submitServiceReport,
} from './tickets.controller'
import { authenticate } from '../../middleware/authenticate'
import { authorize } from '../../middleware/authorize'

const router = Router()
router.use(authenticate)

/**
 * @swagger
 * /api/tickets:
 *   get:
 *     tags: [Tickets]
 *     summary: Get all tickets (filtered by organization for hospital users)
 *     responses:
 *       200:
 *         description: List of tickets
 */
router.get('/', getAll)

/**
 * @swagger
 * /api/tickets/{id}:
 *   get:
 *     tags: [Tickets]
 *     summary: Get ticket details with full history
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Full ticket details
 */
router.get('/:id', getById)

/**
 * @swagger
 * /api/tickets:
 *   post:
 *     tags: [Tickets]
 *     summary: Create a new service ticket
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [assetId, title, description]
 *             properties:
 *               assetId:
 *                 type: string
 *               title:
 *                 type: string
 *                 example: Bed motor not responding
 *               description:
 *                 type: string
 *                 example: The elevation motor stopped working during patient transfer
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, critical]
 *               category:
 *                 type: string
 *                 enum: [mechanical, electrical, software, preventive_maintenance, other]
 *     responses:
 *       201:
 *         description: Ticket created with SLA deadline
 */
router.post('/', authorize('hospital_staff', 'hospital_admin', 'vendor_admin', 'manager'), create)

/**
 * @swagger
 * /api/tickets/{id}/status:
 *   patch:
 *     tags: [Tickets]
 *     summary: Update ticket status
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [open, acknowledged, in_progress, pending_parts, resolved, closed, cancelled]
 *               note:
 *                 type: string
 *     responses:
 *       200:
 *         description: Status updated and logged to history
 */
router.patch('/:id/status', authorize('vendor_admin', 'manager', 'technician'), updateStatus)

/**
 * @swagger
 * /api/tickets/{id}/assign:
 *   post:
 *     tags: [Tickets]
 *     summary: Assign a technician to a ticket
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [technicianId]
 *             properties:
 *               technicianId:
 *                 type: string
 *               eta:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Technician assigned
 */
router.post('/:id/assign', authorize('vendor_admin', 'manager'), assign)

/**
 * @swagger
 * /api/tickets/{id}/comments:
 *   post:
 *     tags: [Tickets]
 *     summary: Add a comment to a ticket
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [body]
 *             properties:
 *               body:
 *                 type: string
 *                 example: Technician is on the way
 *               isInternal:
 *                 type: boolean
 *                 description: Internal notes are hidden from hospital users
 *     responses:
 *       201:
 *         description: Comment added
 */
router.post('/:id/comments', comment)

/**
 * @swagger
 * /api/tickets/{id}/service-report:
 *   post:
 *     tags: [Tickets]
 *     summary: Submit a service report (technician only) — auto-resolves the ticket
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [diagnosis, workPerformed, rootCause, visitStart, visitEnd]
 *             properties:
 *               diagnosis:
 *                 type: string
 *               workPerformed:
 *                 type: string
 *               rootCause:
 *                 type: string
 *                 enum: [hardware_failure, user_error, software_bug, wear_and_tear, other]
 *               visitStart:
 *                 type: string
 *                 format: date-time
 *               visitEnd:
 *                 type: string
 *                 format: date-time
 *               laborMinutes:
 *                 type: integer
 *               partsUsed:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     partName:
 *                       type: string
 *                     quantity:
 *                       type: integer
 *                     unitCost:
 *                       type: number
 *     responses:
 *       201:
 *         description: Service report submitted and ticket resolved
 */
router.post('/:id/service-report', authorize('technician', 'vendor_admin'), submitServiceReport)

export default router