import { Router } from 'express'
import {
  getAll,
  getMe,
  getById,
  updateMe,
  update,
  deactivate,
  listTechnicians,
} from './users.controller'
import { authenticate } from '../../middleware/authenticate'
import { authorize } from '../../middleware/authorize'

const router = Router()

router.use(authenticate)

// Own profile — any logged in user
router.get('/me', getMe)
router.patch('/me', updateMe)

// Technician list — managers and vendor_admin for ticket assignment
router.get('/technicians', authorize('vendor_admin', 'manager'), listTechnicians)

// Admin operations
router.get('/', authorize('vendor_admin', 'manager', 'hospital_admin'), getAll)
router.get('/:id', authorize('vendor_admin', 'manager', 'hospital_admin'), getById)
router.patch('/:id', authorize('vendor_admin', 'manager'), update)
router.delete('/:id', authorize('vendor_admin'), deactivate)

export default router