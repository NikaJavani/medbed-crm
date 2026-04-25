import { Router } from 'express'
import {
  ticketSummary,
  ticketsByCategory,
  ticketsByPriority,
  assetHealth,
  technicianPerformance,
  organizationSummary,
  recentActivity,
} from './analytics.controller'
import { authenticate } from '../../middleware/authenticate'
import { authorize } from '../../middleware/authorize'

const router = Router()

router.use(authenticate)
router.use(authorize('vendor_admin', 'manager', 'hospital_admin'))

/**
 * @swagger
 * /api/analytics/tickets/summary:
 *   get:
 *     tags: [Analytics]
 *     summary: Ticket counts by status + SLA compliance rate
 *     responses:
 *       200:
 *         description: Ticket summary statistics
 */
router.get('/tickets/summary', ticketSummary)

/**
 * @swagger
 * /api/analytics/tickets/by-category:
 *   get:
 *     tags: [Analytics]
 *     summary: Ticket counts grouped by category
 *     responses:
 *       200:
 *         description: Tickets by category
 */
router.get('/tickets/by-category', ticketsByCategory)

/**
 * @swagger
 * /api/analytics/tickets/by-priority:
 *   get:
 *     tags: [Analytics]
 *     summary: Ticket counts grouped by priority
 *     responses:
 *       200:
 *         description: Tickets by priority
 */
router.get('/tickets/by-priority', ticketsByPriority)

/**
 * @swagger
 * /api/analytics/assets/health:
 *   get:
 *     tags: [Analytics]
 *     summary: Asset health scores based on ticket frequency
 *     responses:
 *       200:
 *         description: Asset health report
 */
router.get('/assets/health', assetHealth)

/**
 * @swagger
 * /api/analytics/technicians/performance:
 *   get:
 *     tags: [Analytics]
 *     summary: Technician performance — tickets resolved, avg labor time
 *     responses:
 *       200:
 *         description: Technician performance stats
 */
router.get('/technicians/performance', technicianPerformance)

/**
 * @swagger
 * /api/analytics/organizations/summary:
 *   get:
 *     tags: [Analytics]
 *     summary: Per-hospital ticket and asset summary (vendor_admin only)
 *     responses:
 *       200:
 *         description: Organization summary
 */
router.get(
  '/organizations/summary',
  authorize('vendor_admin', 'manager'),
  organizationSummary
)

/**
 * @swagger
 * /api/analytics/activity:
 *   get:
 *     tags: [Analytics]
 *     summary: Recent tickets and status changes
 *     responses:
 *       200:
 *         description: Recent activity feed
 */
router.get('/activity', recentActivity)

export default router