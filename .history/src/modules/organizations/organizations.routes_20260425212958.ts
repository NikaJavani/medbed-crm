import { Router } from 'express'
import { getAll, getById, create, update, deactivate } from './organizations.controller'
import { authenticate } from '../../middleware/authenticate'
import { authorize } from '../../middleware/authorize'

const router = Router()

// All routes require login
router.use(authenticate)

// Any logged-in user can view organizations
router.get('/', getAll)
router.get('/:id', getById)

// Only vendor_admin can create, update, deactivate
router.post('/', authorize('vendor_admin'), create)
router.patch('/:id', authorize('vendor_admin', 'manager'), update)
router.delete('/:id', authorize('vendor_admin'), deactivate)

export default router