import NotificationModel from "../modules/notification.model";
import { CatchAsyncError } from "../middleware/catchAsyncError";
import errorHandler from "../utils/errorHandler";
import { NextFunction, Response, Request } from "express";
import cron from "node-cron";
import userModel from "../modules/user.model";

//get all notifications --only admin
export const getNotification = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const notification = await NotificationModel.find().sort({ createdAt: -1 });

        res.status(201).json({
            success: true,
            message: "Notifications fetched successfully",
            notification: notification
        });

    } catch (err: any) {
        return next(new errorHandler(err.message, 500));
    }
});


//update status of notifications

export const updateNotificationStatus = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const notification = await NotificationModel.findById(req.params.id);

        if (!notification) {
            return next(new errorHandler("Notification Not found", 500));
        }
        else {
            notification.status ? notification.status = "read" : notification.status;
        }

        await notification.save();

        const notifications = await NotificationModel.find().sort({ createdAt: -1 });

        res.status(201).json({
            success: true,
            message: "Notifications updated successfully",
            notifications: notifications
        });

    } catch (err: any) {
        return next(new errorHandler(err.message, 500));
    }
});

// delete notifications --only administrator

cron.schedule("0 0 0 * * *",async()=>{
    const thirtDaysAgo = new Date(Date.now()-30*24*60*1000);

    await NotificationModel.deleteMany({status:"read",createdAt:{$lt:thirtDaysAgo}});

    console.log('Delete read notifications');
})

