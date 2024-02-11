const taskRouter = require('./task.route')

module.exports = (app) => {
    const version = '/api/v1'
    app.use(version + '/tasks', taskRouter)
}
