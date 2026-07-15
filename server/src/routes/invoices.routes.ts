import express from 'express'
import {
  listInvoices,
  getInvoice,
  createInvoice,
  updateInvoiceStatus,
} from '../controllers/invoices.controller.js'
import { authMiddleware } from '../middleware/auth.middleware.js'

const router = express.Router()

router.use(authMiddleware)
router.get('/', listInvoices)
router.post('/', createInvoice)
router.get('/:id', getInvoice)
router.patch('/:id/status', updateInvoiceStatus)

export default router
