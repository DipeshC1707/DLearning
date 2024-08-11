"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.updateUserRole = exports.getAllUsers = exports.updateporfilePicture = exports.updatePassword = exports.updateUserInfo = exports.socialAuth = exports.getUserInfo = exports.updateAcceessToken = exports.logoutUser = exports.loginUser = exports.activateUser = exports.createActivationToken = exports.registerUser = void 0;
const user_model_1 = __importDefault(require("../modules/user.model"));
const errorHandler_1 = __importDefault(require("../utils/errorHandler"));
const catchAsyncError_1 = require("../middleware/catchAsyncError");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const ejs_1 = __importDefault(require("ejs"));
const path_1 = __importDefault(require("path"));
const sendMail_1 = __importDefault(require("../utils/sendMail"));
const jwt_1 = require("../utils/jwt");
const redis_1 = require("../utils/redis");
const user_service_1 = require("../services/user.service");
const cloudinary_1 = __importDefault(require("cloudinary"));
require('dotenv').config();
exports.registerUser = (0, catchAsyncError_1.CatchAsyncError)(async (req, res, next) => {
    try {
        const { name, email, password } = req.body;
        const isEmailExist = await user_model_1.default.findOne({ email });
        if (isEmailExist) {
            return next(new errorHandler_1.default("Email already Exist", 400));
        }
        const user = {
            name,
            email,
            password
        };
        const activationToken = (0, exports.createActivationToken)(user);
        const activationCode = activationToken.activationCode;
        const data = { user: { name: user.name }, activationCode };
        const html = ejs_1.default.renderFile(path_1.default.join(__dirname, "../mails/activationMail.ejs"), data);
        try {
            await (0, sendMail_1.default)({
                email: user.email,
                subject: "Account Activation",
                template: "activationMail.ejs",
                data
            });
            res.status(200).json({ success: true, message: `Please check your email: ${user.email} to activate your account!`, activationToken: activationToken.token });
        }
        catch (err) {
            return next(new errorHandler_1.default(err.message, 400));
        }
    }
    catch (error) {
        return next(new errorHandler_1.default(error.message, 400));
    }
});
const createActivationToken = (user) => {
    const activationCode = Math.floor(1000 + Math.random() * 9000).toString();
    const token = jsonwebtoken_1.default.sign({
        user, activationCode
    }, process.env.ACTIVATION_SECRET_KEY, {
        expiresIn: '5m'
    });
    return {
        token,
        activationCode
    };
};
exports.createActivationToken = createActivationToken;
exports.activateUser = (0, catchAsyncError_1.CatchAsyncError)(async (req, res, next) => {
    try {
        const { activation_code, activation_token } = req.body;
        const newUser = jsonwebtoken_1.default.verify(activation_token, process.env.ACTIVATION_SECRET_KEY);
        if (newUser.activationCode !== activation_code) {
            return next(new errorHandler_1.default("Invalid activation code", 400));
        }
        const { name, email, password } = newUser.user;
        const existUser = await user_model_1.default.findOne({ email: email });
        if (existUser) {
            return next(new errorHandler_1.default("User already Exist", 400));
        }
        const user = await user_model_1.default.create({
            name: name,
            email: email,
            password: password
        });
        res.status(201).json({
            success: true
        });
    }
    catch (error) {
        return next(new errorHandler_1.default(error.message, 200));
    }
});
exports.loginUser = (0, catchAsyncError_1.CatchAsyncError)(async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return next(new errorHandler_1.default("Please provide email and password", 400));
        }
        ;
        const user = await user_model_1.default.findOne({ email }).select("+password");
        if (!user) {
            return next(new errorHandler_1.default("Invalid email or password", 400));
        }
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return next(new errorHandler_1.default("Invalid Password", 400));
        }
        (0, jwt_1.sendToken)(user, 200, res);
    }
    catch (err) {
        return new errorHandler_1.default(err.message, 400);
    }
});
exports.logoutUser = (0, catchAsyncError_1.CatchAsyncError)(async (req, res, next) => {
    try {
        res.cookie("access_token", "", { maxAge: 1 });
        res.cookie("refresh_token", "", { maxAge: 1 });
        const userID = req.user?._id || '';
        redis_1.redis.del(userID);
        res.status(200).json({
            success: true,
            message: "Logged out successfully",
        });
    }
    catch (err) {
        return next(new errorHandler_1.default(err.message, 400));
    }
});
//update access token
exports.updateAcceessToken = (0, catchAsyncError_1.CatchAsyncError)(async (req, res, next) => {
    try {
        const refresh_token = req.cookies.refresh_token;
        const decoded = jsonwebtoken_1.default.verify(refresh_token, process.env.REFRESH_TOKEN);
        if (!decoded) {
            return next(new errorHandler_1.default("Invalid refresh token", 400));
        }
        const session = await redis_1.redis.get(decoded.id);
        if (!session) {
            return next(new errorHandler_1.default("Please Login to access these resources", 400));
        }
        const user = JSON.parse(session);
        const accessToken = jsonwebtoken_1.default.sign({
            id: user._id
        }, process.env.ACCESS_TOKEN, {
            expiresIn: '5m'
        });
        const refreshToken = jsonwebtoken_1.default.sign({ id: user._id }, process.env.REFRESH_TOKEN, { expiresIn: '3d' });
        req.user = user;
        res.cookie("access_token", accessToken, jwt_1.accessTokenOptions);
        res.cookie("refresh_token", refreshToken, jwt_1.refreshTokenOptions);
        await redis_1.redis.set(user._id, JSON.stringify(user), "EX", 604800); //7days Expire
        next();
    }
    catch (error) {
        return next(new errorHandler_1.default(error.message, 400));
    }
});
// get user info
exports.getUserInfo = (0, catchAsyncError_1.CatchAsyncError)(async (req, res, next) => {
    try {
        const userID = req?.user._id;
        (0, user_service_1.getUserById)(userID, res);
    }
    catch (error) {
        return next(new errorHandler_1.default(error.message, 400));
    }
});
//social auth
exports.socialAuth = (0, catchAsyncError_1.CatchAsyncError)(async (req, res, next) => {
    try {
        const { email, name, avatar } = req.body;
        const user = await user_model_1.default.findOne({ email });
        if (!user) {
            const newUser = await user_model_1.default.create({
                email: email, name: name, avatar: avatar
            });
            (0, jwt_1.sendToken)(newUser, 200, res);
        }
        else {
            (0, jwt_1.sendToken)(user, 200, res);
        }
    }
    catch (err) {
        return next(new errorHandler_1.default(err.message, 400));
    }
});
exports.updateUserInfo = (0, catchAsyncError_1.CatchAsyncError)(async (req, res, next) => {
    try {
        const { name } = req.body;
        const userID = req.user?._id;
        const user = await user_model_1.default.findById(userID);
        if (name && user) {
            user.name = name;
        }
        await user?.save();
        await redis_1.redis.set(userID, JSON.stringify(user));
        res.status(201).json({
            success: true,
            user: user
        });
    }
    catch (err) {
    }
});
exports.updatePassword = (0, catchAsyncError_1.CatchAsyncError)(async (req, res, next) => {
    try {
        const { oldPassword, newPassword } = req.body;
        if (!oldPassword || !newPassword) {
            return next(new errorHandler_1.default("Enter old and new password", 400));
        }
        const user = await user_model_1.default.findById(req?.user._id).select("+password");
        if (user?.password === undefined) {
            return next(new errorHandler_1.default("Invalid User", 400));
        }
        const isPasswordMatch = await user?.comparePassword(oldPassword);
        if (!isPasswordMatch) {
            return next(new errorHandler_1.default("Invalid password", 400));
        }
        user.password = newPassword;
        await user.save();
        await redis_1.redis.set(req?.user._id, JSON.stringify(user));
        res.status(201).json({
            success: true,
            user: user
        });
    }
    catch (err) {
        return next(new errorHandler_1.default(err.message, 400));
    }
});
exports.updateporfilePicture = (0, catchAsyncError_1.CatchAsyncError)(async (req, res, next) => {
    try {
        const { avatar } = req.body;
        const userID = req?.user?._id;
        const user = await user_model_1.default.findById(userID);
        if (avatar && user) {
            if (user?.avatar?.public_id) {
                //delete first old image
                await cloudinary_1.default.v2.uploader.destroy(user?.avatar?.public_id);
                const mycloud = await cloudinary_1.default.v2.uploader.upload(avatar, {
                    folder: "avatar",
                    width: 150
                });
                user.avatar = {
                    public_id: mycloud.public_id,
                    url: mycloud.secure_url
                };
            }
            else {
                const mycloud = await cloudinary_1.default.v2.uploader.upload(avatar, {
                    folder: "avatar",
                    width: 150
                });
                user.avatar = {
                    public_id: mycloud.public_id,
                    url: mycloud.secure_url
                };
            }
        }
        await user?.save();
        await redis_1.redis.set(req?.user._id, JSON.stringify(user));
        res.status(201).json({
            success: true,
            user: user
        });
    }
    catch (err) {
    }
});
//get all users --only-for-admin
exports.getAllUsers = (0, catchAsyncError_1.CatchAsyncError)(async (req, res, next) => {
    try {
        (0, user_service_1.getAllUsersService)(res);
    }
    catch (err) {
        return next(new errorHandler_1.default(err.message, 400));
    }
});
// update user role -- only for admin
exports.updateUserRole = (0, catchAsyncError_1.CatchAsyncError)(async (req, res, next) => {
    try {
        const { id, role } = req.body;
        (0, user_service_1.updateUserRoleService)(res, id, role);
    }
    catch (err) {
        return next(new errorHandler_1.default(err.message, 400));
    }
});
//Delete User --only admin
exports.deleteUser = (0, catchAsyncError_1.CatchAsyncError)(async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = await user_model_1.default.findById(id);
        if (!user) {
            return next(new errorHandler_1.default("User not found", 404));
        }
        await user?.deleteOne({ id });
        await redis_1.redis.del(id);
        res.status(201).json({
            success: true,
            message: "User deleted successfully",
            user: user
        });
    }
    catch (err) {
        return next(new errorHandler_1.default(err.message, 400));
    }
});
