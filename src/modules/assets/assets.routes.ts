import { Router } from 'express'
import {
  getModels,
  createModel,
  getAll,
  getById,
  create,
  update,
  remove,
} from './assets.controller'
import { authenticate } from '../../middleware/authenticate'
import { authorize } from '../../middleware/authorize'

const router = Router()

router.use(authenticate)

// Asset models — the bed product catalog
router.get('/models', getModels)
router.post('/models', authorize('vendor_admin'), createModel)

// Individual physical beds
router.get('/', getAll)
router.get('/:id', getById)
router.post('/', authorize('vendor_admin', 'manager', 'hospital_admin'), create)
router.patch('/:id', authorize('vendor_admin', 'manager', 'hospital_admin'), update)
router.delete('/:id', authorize('vendor_admin'), remove)

export default router