import { Request, Response, NextFunction } from "express"
import User from "../models/user.model"

const requireAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        if (req.headers.authorization) {
            const token: string = req.headers.authorization.split(' ')[1]
            const user = await User.findOne({
                token: token
            }).select('-password')
            if (!user) {
                res.json({
                    code: 401,
                    message: 'Request needs authorization'
                })
            }

            req['user'] = user

            next()
        }
        else {
            res.json({
                code: 401,
                message: 'Request needs authorization'
            })
        }
    }
    catch (error) {
        res.json({
            code: 401,
            message: 'An error occured while requiring authorization'
        })
    }
}

export { requireAuth }