const User = require('../models/user.model')

// helpers
const generateHelper = require('../../../helpers/generate.helper')

// hash password with md5
const md5 = require('md5')

// [POST] /api/v1/users/register
module.exports.register = async (req, res) => {
    try {
        req.body.password = md5(req.body.password)

        const user = new User({
            fullName: req.body.fullName,
            email: req.body.email,
            password: req.body.password,
            token: generateHelper.generateRandomString(30)
        })
        await user.save()

        const token = user.token
        res.cookie('token', token)

        res.json({
            code: 200,
            message: 'Create user account successfully',
            token: token
        })
    } catch (error) {
        console.log('Error occured:', error);
        res.json({
            code: 400,
            message: 'An error occured while registering the account'
        });
    }
}
