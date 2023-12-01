import express from "express"
import UserController from '../controllers/users.js'
const router = express.Router()

router.post('/signup',UserController.create)

router.post('/login',UserController.login)
router.post('/forgotPassword',UserController.forgotPassword)
router.put('/resetPassword',UserController.resetPassword)

export default router   