import { Response, NextFunction } from 'express'
import { AuthRequest } from '../../middleware/authenticate'
import {
  getAllAssetModels,
  createAssetModel,
  getAllAssets,
  getAssetById,
  createAsset,
  updateAsset,
  deleteAsset,
} from './assets.service'
import {
  createAssetModelSchema,
  createAssetSchema,
  updateAssetSchema,
} from './assets.schema'

// ── Asset Models ──────────────────────────────────────────

export const getModels = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const models = await getAllAssetModels()
    res.json({ data: models })
  } catch (err) {
    next(err)
  }
}

export const createModel = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const parsed = createAssetModelSchema.safeParse(req.body)
    if (!parsed.success) {
      res.status(400).json({ errors: parsed.error.flatten().fieldErrors })
      return
    }
    const model = await createAssetModel(parsed.data)
    res.status(201).json({ message: 'Asset model created', data: model })
  } catch (err) {
    next(err)
  }
}

// ── Assets ────────────────────────────────────────────────

export const getAll = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const isVendorSide =
      req.user?.role === 'vendor_admin' || req.user?.role === 'manager'

    const organizationId = isVendorSide
      ? (req.query.organizationId as string | undefined)
      : req.user?.organizationId

    const assets = await getAllAssets(organizationId)
    res.json({ data: assets })
  } catch (err) {
    next(err)
  }
}

export const getById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const asset = await getAssetById(req.params.id as string)
    res.json({ data: asset })
  } catch (err) {
    next(err)
  }
}

export const create = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const parsed = createAssetSchema.safeParse(req.body)
    if (!parsed.success) {
      res.status(400).json({ errors: parsed.error.flatten().fieldErrors })
      return
    }
    const asset = await createAsset(parsed.data)
    res.status(201).json({ message: 'Asset created', data: asset })
  } catch (err) {
    next(err)
  }
}

export const update = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const parsed = updateAssetSchema.safeParse(req.body)
    if (!parsed.success) {
      res.status(400).json({ errors: parsed.error.flatten().fieldErrors })
      return
    }
    const asset = await updateAsset(req.params.id as string, parsed.data)
    res.json({ message: 'Asset updated', data: asset })
  } catch (err) {
    next(err)
  }
}

export const remove = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await deleteAsset(req.params.id as string)
    res.json({ message: 'Asset deleted' })
  } catch (err) {
    next(err)
  }
}