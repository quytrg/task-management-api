import { Request, Response } from "express"
import User from "../models/user.model"
import ForgotPassword from "../models/forgot-password.model"

// helpers
import { generateRandomString, generateRandomNumber } from "../../../helpers/generate.helper"
import sendEmail from "../../../helpers/sendEmail.helper"

// hash password with md5
import md5 from 'md5'

// [POST] /api/v1/users/register
export const register = async (req: Request, res: Response) => {
    try {
        const emailExist = await User.findOne({ email: req.body.email, deleted: false })

        if (emailExist) {
            res.json({
                code: 400,
                message: 'User already exists'
            })
            return
        }
        req.body.password = md5(req.body.password)
        const user = new User({
            fullName: req.body.fullName,
            email: req.body.email,
            password: req.body.password,
            token: generateRandomString(30)
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

// [POST] /api/v1/users/login
export const login = async (req: Request, res: Response) => {
    try {
        const email = req.body.email
        const password = req.body.password

        const user = await User.findOne({ email: email, deleted: false })

        if (!user) {
            res.json({
                code: 400,
                message: 'Email does not existed',
            })
            return
        }

        if (user.password !== md5(password)) {
            res.json({
                code: 400,
                message: 'Password does not match',
            })
            return
        }

        const token = user.token
        res.cookie('token', token)

        res.json({
            code: 200,
            message: 'Login successfully',
            token: token
        })
    } catch (error) {
        console.log('Error occured:', error);
        res.json({
            code: 400,
            message: 'An error occured while logining to the account'
        });
    }
}

// [POST] /api/v1/users/password/forgot
export const forgotPassword = async (req: Request, res: Response) => {
    try {
        const email = req.body.email

        const user = await User.findOne({ email: email, deleted: false })

        if (!user) {
            res.json({
                code: 400,
                message: 'Email does not existed',
            })
            return
        }

        // save otp data to forgot-password model
        const expireTime = 3
        const otp = generateRandomNumber(6)
        const forgotPasswordObject = {
            email: email,
            otp: otp,
            expireAt: Date.now() + expireTime * 60 * 1000
        }
        const forgotPassword = new ForgotPassword(forgotPasswordObject)
        await forgotPassword.save()

        // send otp to user's email
        const emailSubject = 'Mã OTP xác minh lấy lại mật khẩu'
        const emailContentHtml = `
            Mã OTP xác minh lấy lại mật khẩu là <b>${otp}</b>. Thời hạn sử dụng là ${expireTime} phút. Lưu ý không được để lộ mã OTP. 
        `
        sendEmail(user.email, emailSubject, emailContentHtml)

        res.json({
            code: 200,
            message: 'Send opt code to user email successfully',
        })
    } catch (error) {
        console.log('Error occured:', error);
        res.json({
            code: 400,
            message: 'An error occured while implement forgetten password procedure'
        });
    }
}

// [POST] /api/v1/users/password/otp
export const otpPassword = async (req: Request, res: Response) => {
    try {
        const email = req.body.email
        const otp = req.body.otp

        const forgotPassword = await ForgotPassword.findOne({
            email: email,
            otp: otp    
        })

        if (!forgotPassword) {
            res.json({
                code: 400,
                message: 'Email or otp code is not valid',
            })
            return
        }

        const user = await User.findOne({
            email: email
        })

        const token = user.token
        res.cookie('token', token)
        
        res.json({
            code: 200,
            message: 'Successful authentication',
            token: token
        })
    } catch (error) {
        console.log('Error occured:', error);
        res.json({
            code: 400,
            message: 'An error occured while retriving email and otp'
        });
    }
}

// [POST] /api/v1/users/password/reset
export const resetPassword = async (req: Request, res: Response) => {
    try {
        const token = req['user'].token
        const password = req.body.password

        const user = await User.findOne({
            token: token
        })

        if (!user) {
            res.json({
                code: 400,
                message: 'User not found',
            })
        }

        await User.updateOne({
            token: token
        }, {
            password: md5(password)
        })
        
        res.json({
            code: 200,
            message: 'Change password successfully',
        })
    } catch (error) {
        console.log('Error occured:', error);
        res.json({
            code: 400,
            message: 'An error occured while reseting password'
        });
    }
}

// [GET] /api/v1/users/detail
export const detail = async (req: Request, res: Response) => {
    try { 
        res.json({
            code: 200,
            message: 'Retrive user information successfully',
            info: req['user']
        })
    } catch (error) {
        console.log('Error occured:', error);
        res.json({
            code: 400,
            message: 'An error occured while retriving email and otp'
        });
    }
}

// [GET] /api/v1/users
export const index = async (req: Request, res: Response) => {
    try { 
        const users = await User.find({ deleted: false }).select('fullName email')
        res.json({
            code: 200,
            message: 'Retrive users information successfully',
            users
        })
    } catch (error) {
        console.log('Error occured:', error);
        res.json({
            code: 400,
            message: 'An error occured while retriving email and otp'
        });
    }
}