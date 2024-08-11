"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrdersAnalyticsData = exports.getCoursesAnalyticsData = exports.getAnalyticsData = void 0;
const errorHandler_1 = __importDefault(require("../utils/errorHandler"));
const catchAsyncError_1 = require("../middleware/catchAsyncError");
const analytics_generator_1 = require("../utils/analytics.generator");
const user_model_1 = __importDefault(require("../modules/user.model"));
const course_model_1 = __importDefault(require("../modules/course.model"));
const order_model_1 = __importDefault(require("../modules/order.model"));
// get user analytics data --only admin
exports.getAnalyticsData = (0, catchAsyncError_1.CatchAsyncError)(async (req, res, next) => {
    try {
        const users = await (0, analytics_generator_1.generateLast12MonthData)(user_model_1.default);
        res.status(200).json({
            success: true,
            users
        });
    }
    catch (error) {
        return next(new errorHandler_1.default(error.message, 400));
    }
});
// get course analytics data --only admin
exports.getCoursesAnalyticsData = (0, catchAsyncError_1.CatchAsyncError)(async (req, res, next) => {
    try {
        const courses = await (0, analytics_generator_1.generateLast12MonthData)(course_model_1.default);
        res.status(200).json({
            success: true,
            courses
        });
    }
    catch (error) {
        return next(new errorHandler_1.default(error.message, 400));
    }
});
// get course analytics data --only admin
exports.getOrdersAnalyticsData = (0, catchAsyncError_1.CatchAsyncError)(async (req, res, next) => {
    try {
        const orders = await (0, analytics_generator_1.generateLast12MonthData)(order_model_1.default);
        res.status(200).json({
            success: true,
            orders
        });
    }
    catch (error) {
        return next(new errorHandler_1.default(error.message, 400));
    }
});
