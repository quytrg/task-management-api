const express = require('express')
const router = express.Router()

const controller = require('../controller/user.controller')

router.post('/register', controller.register)

module.exports = router