import { Response,Request,NextFunction } from "express";
import errorHandler from "../utils/errorHandler";
import { CatchAsyncError } from "../middleware/catchAsyncError";
import { generateLast12MonthData } from "../utils/analytics.generator";
import userModel from "../modules/user.model";
import CourseModel from "../modules/course.model";
import OrderModel from "../modules/order.model";


// get user analytics data --only admin

export const getAnalyticsData = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const users = await generateLast12MonthData(userModel);

        res.status(200).json({
            success: true,
            users
        });
    } catch (error) {
        return next(new errorHandler(error.message, 400));
    }
})

// get course analytics data --only admin

export const getCoursesAnalyticsData = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const courses = await generateLast12MonthData(CourseModel);

        res.status(200).json({
            success: true,
            courses
        });
    } catch (error) {
        return next(new errorHandler(error.message, 400));
    }
})

// get course analytics data --only admin

export const getOrdersAnalyticsData = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const orders = await generateLast12MonthData(OrderModel);

        res.status(200).json({
            success: true,
            orders
        });
    } catch (error) {
        return next(new errorHandler(error.message, 400));
    }
})
