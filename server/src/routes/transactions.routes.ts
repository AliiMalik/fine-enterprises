import express from 'express'
import {
  listTransactions,
  createTransaction,
  summary,
} from '../controllers/transactions.controller.js'
import { authMiddleware } from '../middleware/auth.middleware.js'

const router = express.Router()

router.use(authMiddleware)
router.get('/summary', summary)
router.get('/', listTransactions)
router.post('/', createTransaction)

export default router
