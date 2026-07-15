import express from 'express'
import { listBills, getBill, createBill, updateBillStatus } from '../controllers/bills.controller.js'
import { authMiddleware } from '../middleware/auth.middleware.js'

const router = express.Router()

router.use(authMiddleware)
router.get('/', listBills)
router.get('/:id', getBill)
router.post('/', createBill)
router.patch('/:id/status', updateBillStatus)

export default router
