const express = require('express')
const router = express.Router()

const controller = require('../controller/user.controller')

// middlewares
const authMiddleware = require('../middlewares/auth.middleware')

router.post('/register', controller.register)

router.post('/login', controller.login)

router.post('/password/forgot', controller.forgotPassword)

router.post('/password/otp', controller.otpPassword)

router.post('/password/reset', authMiddleware.requireAuth, controller.resetPassword)

router.get('/detail', authMiddleware.requireAuth, controller.detail)

router.get('/', authMiddleware.requireAuth, controller.index)

module.exports = router