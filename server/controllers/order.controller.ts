import { Request, Response, NextFunction } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncError";
import errorHandler from "../utils/errorHandler";
import userModel from "../modules/user.model";
import OrderModel, { IOrder } from "../modules/order.model";
import CourseModel from "../modules/course.model";
import path from "path";
import ejs from "ejs";
import sendMail from "../utils/sendMail";
import NotificationModel from "../modules/notification.model";
import { getAllOrdersService, newOrder } from "../services/order.service";

//creat order

export const createOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { courseId, payment_info } = req.body as IOrder;

        const user = await userModel.findById(req.user?._id);

        const courseExistInUser = user?.courses.some((course: any) => course._id.toString() === courseId)

        if (courseExistInUser) {
            return next(new errorHandler("You have already purchased this course", 400));
        }

        const course = await CourseModel.findById(courseId);

        if (!course) {
            return next(new errorHandler("Course not found", 404));
        }

        const data: any = {
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
        }

        const html = await ejs.renderFile(path.join(__dirname, '../mails/order-confirmation.ejs'), { order: mailData });

        try {
            if (user) {
                await sendMail({
                    email: user.email,
                    subject: "Order Confirmation",
                    template: "order-confirmation.ejs",
                    data: mailData
                })
            }
        } catch (err) {
            return next(new errorHandler(err.message, 500));
        }

        user?.courses.push(course?._id);

        await user?.save();

        await NotificationModel.create({
            userId: user?._id,
            title: "New Order",
            messaage: `You have a new order ${course?.name}`,
        });

        course.purchased ? course.purchased+=1 :course.purchased;

        await course?.save();

        newOrder(data, res, next);

    }
    catch (err) {
        return next(new errorHandler(err.message, 400));
    }

}

//get all the orders -- admin only

export const getAllOrders = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        getAllOrdersService(res);
    }
    catch (err) {
        return next(new errorHandler(err.message, 400));
    }
})