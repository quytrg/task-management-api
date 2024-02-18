import { taskRouter } from "./task.route"
import { userRouter } from "./user.route"

// middlewares
import * as authMiddleware from '../middlewares/auth.middleware'

const routesApiVer1 = (app) => {
    const version: string = '/api/v1'

    app.use(version + '/tasks', authMiddleware.requireAuth, taskRouter)

    app.use(version + '/users', userRouter)
}

export default routesApiVer1