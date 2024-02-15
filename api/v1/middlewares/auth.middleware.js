const User = require('../models/user.model')

module.exports.requireAuth = async (req, res, next) => {
    try {
        if (req.headers.authorization) {
            const token = req.headers.authorization.split(' ')[1]
            const user = await User.findOne({
                token: token
            }).select('-password')
            if (!user) {
                res.json({
                    code: 401,
                    message: 'Request needs authorization'
                })
            }

            req.user = user

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