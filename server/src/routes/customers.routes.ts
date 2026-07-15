import express from 'express'
import {
  listCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
} from '../controllers/customers.controller.js'
import { authMiddleware } from '../middleware/auth.middleware.js'

const router = express.Router()

router.use(authMiddleware)
router.get('/', listCustomers)
router.get('/:id', getCustomer)
router.post('/', createCustomer)
router.patch('/:id', updateCustomer)

export default router
