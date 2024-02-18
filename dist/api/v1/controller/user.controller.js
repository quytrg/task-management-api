"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.index = exports.detail = exports.resetPassword = exports.otpPassword = exports.forgotPassword = exports.login = exports.register = void 0;
const user_model_1 = __importDefault(require("../models/user.model"));
const forgot_password_model_1 = __importDefault(require("../models/forgot-password.model"));
const generate_helper_1 = require("../../../helpers/generate.helper");
const sendEmail_helper_1 = __importDefault(require("../../../helpers/sendEmail.helper"));
const md5_1 = __importDefault(require("md5"));
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const emailExist = yield user_model_1.default.findOne({ email: req.body.email, deleted: false });
        if (emailExist) {
            res.json({
                code: 400,
                message: 'User already exists'
            });
            return;
        }
        req.body.password = (0, md5_1.default)(req.body.password);
        const user = new user_model_1.default({
            fullName: req.body.fullName,
            email: req.body.email,
            password: req.body.password,
            token: (0, generate_helper_1.generateRandomString)(30)
        });
        yield user.save();
        const token = user.token;
        res.cookie('token', token);
        res.json({
            code: 200,
            message: 'Create user account successfully',
            token: token
        });
    }
    catch (error) {
        console.log('Error occured:', error);
        res.json({
            code: 400,
            message: 'An error occured while registering the account'
        });
    }
});
exports.register = register;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const email = req.body.email;
        const password = req.body.password;
        const user = yield user_model_1.default.findOne({ email: email, deleted: false });
        if (!user) {
            res.json({
                code: 400,
                message: 'Email does not existed',
            });
            return;
        }
        if (user.password !== (0, md5_1.default)(password)) {
            res.json({
                code: 400,
                message: 'Password does not match',
            });
            return;
        }
        const token = user.token;
        res.cookie('token', token);
        res.json({
            code: 200,
            message: 'Login successfully',
            token: token
        });
    }
    catch (error) {
        console.log('Error occured:', error);
        res.json({
            code: 400,
            message: 'An error occured while logining to the account'
        });
    }
});
exports.login = login;
const forgotPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const email = req.body.email;
        const user = yield user_model_1.default.findOne({ email: email, deleted: false });
        if (!user) {
            res.json({
                code: 400,
                message: 'Email does not existed',
            });
            return;
        }
        const expireTime = 3;
        const otp = (0, generate_helper_1.generateRandomNumber)(6);
        const forgotPasswordObject = {
            email: email,
            otp: otp,
            expireAt: Date.now() + expireTime * 60 * 1000
        };
        const forgotPassword = new forgot_password_model_1.default(forgotPasswordObject);
        yield forgotPassword.save();
        const emailSubject = 'Mã OTP xác minh lấy lại mật khẩu';
        const emailContentHtml = `
            Mã OTP xác minh lấy lại mật khẩu là <b>${otp}</b>. Thời hạn sử dụng là ${expireTime} phút. Lưu ý không được để lộ mã OTP. 
        `;
        (0, sendEmail_helper_1.default)(user.email, emailSubject, emailContentHtml);
        res.json({
            code: 200,
            message: 'Send opt code to user email successfully',
        });
    }
    catch (error) {
        console.log('Error occured:', error);
        res.json({
            code: 400,
            message: 'An error occured while implement forgetten password procedure'
        });
    }
});
exports.forgotPassword = forgotPassword;
const otpPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const email = req.body.email;
        const otp = req.body.otp;
        const forgotPassword = yield forgot_password_model_1.default.findOne({
            email: email,
            otp: otp
        });
        if (!forgotPassword) {
            res.json({
                code: 400,
                message: 'Email or otp code is not valid',
            });
            return;
        }
        const user = yield user_model_1.default.findOne({
            email: email
        });
        const token = user.token;
        res.cookie('token', token);
        res.json({
            code: 200,
            message: 'Successful authentication',
            token: token
        });
    }
    catch (error) {
        console.log('Error occured:', error);
        res.json({
            code: 400,
            message: 'An error occured while retriving email and otp'
        });
    }
});
exports.otpPassword = otpPassword;
const resetPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const token = req['user'].token;
        const password = req.body.password;
        const user = yield user_model_1.default.findOne({
            token: token
        });
        if (!user) {
            res.json({
                code: 400,
                message: 'User not found',
            });
        }
        yield user_model_1.default.updateOne({
            token: token
        }, {
            password: (0, md5_1.default)(password)
        });
        res.json({
            code: 200,
            message: 'Change password successfully',
        });
    }
    catch (error) {
        console.log('Error occured:', error);
        res.json({
            code: 400,
            message: 'An error occured while reseting password'
        });
    }
});
exports.resetPassword = resetPassword;
const detail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        res.json({
            code: 200,
            message: 'Retrive user information successfully',
            info: req['user']
        });
    }
    catch (error) {
        console.log('Error occured:', error);
        res.json({
            code: 400,
            message: 'An error occured while retriving email and otp'
        });
    }
});
exports.detail = detail;
const index = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield user_model_1.default.find({ deleted: false }).select('fullName email');
        res.json({
            code: 200,
            message: 'Retrive users information successfully',
            users
        });
    }
    catch (error) {
        console.log('Error occured:', error);
        res.json({
            code: 400,
            message: 'An error occured while retriving email and otp'
        });
    }
});
exports.index = index;
