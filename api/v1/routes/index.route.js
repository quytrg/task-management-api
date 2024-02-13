const taskRouter = require('./task.route')
const userRouter = require('./user.route')

module.exports = (app) => {
    const version = '/api/v1'

    app.use(version + '/tasks', taskRouter)

    app.use(version + '/users', userRouter)
}
