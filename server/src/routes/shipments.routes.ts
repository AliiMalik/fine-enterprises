import express from 'express'
import { listShipments, createShipment } from '../controllers/shipments.controller.js'
import { authMiddleware } from '../middleware/auth.middleware.js'

const router = express.Router()

router.use(authMiddleware)
router.get('/', listShipments)
router.post('/', createShipment)

export default router
