const taskRouter = require('./task.route')
const userRouter = require('./user.route')

// middlewares
const authMiddleware = require('../middlewares/auth.middleware')

module.exports = (app) => {
    const version = '/api/v1'

    app.use(version + '/tasks', authMiddleware.requireAuth, taskRouter)

    app.use(version + '/users', userRouter)
}
