"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateNotificationStatus = exports.getNotification = void 0;
const notification_model_1 = __importDefault(require("../modules/notification.model"));
const catchAsyncError_1 = require("../middleware/catchAsyncError");
const errorHandler_1 = __importDefault(require("../utils/errorHandler"));
const node_cron_1 = __importDefault(require("node-cron"));
//get all notifications --only admin
exports.getNotification = (0, catchAsyncError_1.CatchAsyncError)(async (req, res, next) => {
    try {
        const notification = await notification_model_1.default.find().sort({ createdAt: -1 });
        res.status(201).json({
            success: true,
            message: "Notifications fetched successfully",
            notification: notification
        });
    }
    catch (err) {
        return next(new errorHandler_1.default(err.message, 500));
    }
});
//update status of notifications
exports.updateNotificationStatus = (0, catchAsyncError_1.CatchAsyncError)(async (req, res, next) => {
    try {
        const notification = await notification_model_1.default.findById(req.params.id);
        if (!notification) {
            return next(new errorHandler_1.default("Notification Not found", 500));
        }
        else {
            notification.status ? notification.status = "read" : notification.status;
        }
        await notification.save();
        const notifications = await notification_model_1.default.find().sort({ createdAt: -1 });
        res.status(201).json({
            success: true,
            message: "Notifications updated successfully",
            notifications: notifications
        });
    }
    catch (err) {
        return next(new errorHandler_1.default(err.message, 500));
    }
});
// delete notifications --only administrator
node_cron_1.default.schedule("0 0 0 * * *", async () => {
    const thirtDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 1000);
    await notification_model_1.default.deleteMany({ status: "read", createdAt: { $lt: thirtDaysAgo } });
    console.log('Delete read notifications');
});
