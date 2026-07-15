import express from 'express'
import { listProducts, createProduct, updateProduct } from '../controllers/products.controller.js'
import { authMiddleware } from '../middleware/auth.middleware.js'

const router = express.Router()

router.use(authMiddleware)
router.get('/', listProducts)
router.post('/', createProduct)
router.patch('/:id', updateProduct)

export default router
