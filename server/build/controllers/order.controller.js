"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllOrders = exports.createOrder = void 0;
const catchAsyncError_1 = require("../middleware/catchAsyncError");
const errorHandler_1 = __importDefault(require("../utils/errorHandler"));
const user_model_1 = __importDefault(require("../modules/user.model"));
const course_model_1 = __importDefault(require("../modules/course.model"));
const path_1 = __importDefault(require("path"));
const ejs_1 = __importDefault(require("ejs"));
const sendMail_1 = __importDefault(require("../utils/sendMail"));
const notification_model_1 = __importDefault(require("../modules/notification.model"));
const order_service_1 = require("../services/order.service");
//creat order
const createOrder = async (req, res, next) => {
    try {
        const { courseId, payment_info } = req.body;
        const user = await user_model_1.default.findById(req.user?._id);
        const courseExistInUser = user?.courses.some((course) => course._id.toString() === courseId);
        if (courseExistInUser) {
            return next(new errorHandler_1.default("You have already purchased this course", 400));
        }
        const course = await course_model_1.default.findById(courseId);
        if (!course) {
            return next(new errorHandler_1.default("Course not found", 404));
        }
        const data = {
            courseId: course._id,
            userId: user?._id,
            payment_info
        };
        const mailData = {
            order: {
                userName: user?.name,
                _id: course._id.toString().slice(0, 6),
                name: course.name,
                price: course.price,
                date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
            }
        };
        const html = await ejs_1.default.renderFile(path_1.default.join(__dirname, '../mails/order-confirmation.ejs'), { order: mailData });
        try {
            if (user) {
                await (0, sendMail_1.default)({
                    email: user.email,
                    subject: "Order Confirmation",
                    template: "order-confirmation.ejs",
                    data: mailData
                });
            }
        }
        catch (err) {
            return next(new errorHandler_1.default(err.message, 500));
        }
        user?.courses.push(course?._id);
        await user?.save();
        await notification_model_1.default.create({
            userId: user?._id,
            title: "New Order",
            messaage: `You have a new order ${course?.name}`,
        });
        course.purchased ? course.purchased += 1 : course.purchased;
        await course?.save();
        (0, order_service_1.newOrder)(data, res, next);
    }
    catch (err) {
        return next(new errorHandler_1.default(err.message, 400));
    }
};
exports.createOrder = createOrder;
//get all the orders -- admin only
exports.getAllOrders = (0, catchAsyncError_1.CatchAsyncError)(async (req, res, next) => {
    try {
        (0, order_service_1.getAllOrdersService)(res);
    }
    catch (err) {
        return next(new errorHandler_1.default(err.message, 400));
    }
});
