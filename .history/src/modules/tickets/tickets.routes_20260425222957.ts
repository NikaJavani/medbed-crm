import { Router } from 'express'
import {
  getAll,
  getById,
  create,
  updateStatus,
  assign,
  comment,
  submitServiceReport,
} from './tickets.controller'
import { authenticate } from '../../middleware/authenticate'
import { authorize } from '../../middleware/authorize'

const router = Router()

router.use(authenticate)

// View tickets
router.get('/', getAll)
router.get('/:id', getById)

// Create ticket — hospital staff and above
router.post(
  '/',
  authorize('hospital_staff', 'hospital_admin', 'vendor_admin', 'manager'),
  create
)

// Update status — vendor side and technicians
router.patch(
  '/:id/status',
  authorize('vendor_admin', 'manager', 'technician'),
  updateStatus
)

// Assign technician — managers and vendor_admin only
router.post(
  '/:id/assign',
  authorize('vendor_admin', 'manager'),
  assign
)

// Comments — anyone logged in
router.post('/:id/comments', comment)

// Service report — technicians only
router.post(
  '/:id/service-report',
  authorize('technician', 'vendor_admin'),
  submitServiceReport
)

export default router