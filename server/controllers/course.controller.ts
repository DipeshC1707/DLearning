import { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncError";
import errorHandler from "../utils/errorHandler";
import cloudinary from "cloudinary";
import { createCourse, getAllCoursesService } from "../services/course.service";
import CourseModel from "../modules/course.model";
import { redis } from "../utils/redis";
import mongoose from "mongoose";
import { title } from "process";
import path from "path";
import ejs from "ejs";
import sendMail from "../utils/sendMail";
import NotificationModel from "../modules/notification.model";
import axios from "axios";

//upload course

export const uploadCourse = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = req.body;
        const thumbnail = data.thumbnail;
        if (thumbnail) {
            const mycloud = await cloudinary.v2.uploader.upload(thumbnail, {
                folder: "cources"
            });

            data.thumbnail = {
                public_id: mycloud.public_id,
                url: mycloud.secure_url
            }
        }
        createCourse(data, res, next);
    } catch (err) {
        return next(new errorHandler(err.message, 500));
    }
})

//edit course

export const editCourse = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = req.body;
        const thumbnail = data.thumbnail;
        if (thumbnail) {
            const mycloud = await cloudinary.v2.uploader.upload(thumbnail, {
                folder: "cources"
            });

            data.thumbnail = {
                public_id: mycloud.public_id,
                url: mycloud.secure_url
            }
        }

        const courseID = req.params.id;

        const course = await CourseModel.findByIdAndUpdate(courseID, { $set: data }, { new: true });
        res.status(200).json({
            success: true,
            message: "Course Updated Successfully",
            course: course
        })
    } catch (err) {
        return next(new errorHandler(err.message, 500));
    }
})

//get single course without purchasing

export const getSingleCourse = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const courseID = req.params.id;

        const isCacheExists = await redis.get(courseID)

        if (isCacheExists) {
            const course = JSON.parse(isCacheExists);
            res.status(200).json({
                success: true,
                message: "Course Retrieved Successfully",
                course: course
            })
        }
        else {
            const course = await CourseModel.findById(courseID).select("-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links ");

            await redis.set(courseID, JSON.stringify(course));
            res.status(200).json({
                success: true,
                message: "Course Retrieved Successfully",
                course: course
            })
        }
    } catch (err) {
        return next(new errorHandler(err.message, 500));
    }
})

// get all courses without purchasing

export const getAllCourses = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {

            const courses = await CourseModel.find().select("-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links ");

            res.status(200).json({
                success: true,
                message: "Courses Retrieved Successfully",
                courses: courses
            })
        }
        
        catch (err) {
        return next(new errorHandler(err.message, 500));
    }
})

//get course content only for valid users

export const getCourseByUser = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userCourseList = req.user?.courses;

        const courseID = req.params.id;

        const courseExists = userCourseList?.find((course: any) => course._id === courseID);

        if (!courseExists) {
            return next(new errorHandler("You are not eligible to access this course!", 404));
        }

        const course = await CourseModel.findById(courseID);

        const content = course?.courseData;

        res.status(200).json({
            success: true,
            message: "Course Content Retrieved Successfully",
            content: content
        })
    } catch (error) {
        return next(new errorHandler(error.message, 500));
    }
});

//add questions
interface IAddQuestion {
    question: string;
    courseId: string;
    contentId: string;
}

export const addQuestion = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { question, courseId, contentId } = req.body as IAddQuestion;

        const course = await CourseModel.findById(courseId);

        if (!mongoose.Types.ObjectId.isValid(courseId)) {
            return next(new errorHandler("Invalid course id", 400));
        }

        const courseContent = course?.courseData?.find((item: any) => item._id.equals(contentId));

        if (!courseContent) {
            return next(new errorHandler("Invalid content id", 400));
        }
        // create a new question object
        const newQuestion: any = {
            user: req.user,
            question,
            questionReplies: []
        }

        // add this question to the course content

        courseContent.questions.push(newQuestion);

        await NotificationModel.create({
            userId: req.user?._id,
            title: "New Question",
            messaage: `You have a new question in ${courseContent?.title}`,
        });


        //save the updated course

        await course?.save();

        res.status(200).json({
            success: true,
            message: "Question Added Successfully",
            question: newQuestion
        })
    }
    catch (err: any) {
        return next(new errorHandler(err.message, 400));
    }
})

//give answers

interface IAddAnswerData {
    answer: string;
    courseId: string;
    contentId: string;
    questionId: string;
}

export const addAnswer = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { answer, courseId, contentId, questionId } = req.body as IAddAnswerData;

        const course = await CourseModel.findById(courseId);

        if (!mongoose.Types.ObjectId.isValid(courseId)) {
            return next(new errorHandler("Invalid course id", 400));
        }

        const courseContent = course?.courseData?.find((item: any) => item._id.equals(contentId));

        if (!courseContent) {
            return next(new errorHandler("Invalid content id", 400));
        }

        const question = courseContent?.questions?.find((item: any) => item._id.equals(questionId));

        if (!question) {
            return next(new errorHandler("Invalid question id", 400));
        }

        //create new answer object

        const newAnswer: any = {
            user: req.user,
            answer
        }

        //add answer to our course content
        question.questionReplies.push(newAnswer);

        await course?.save();

        if (req.user?._id === question.user._id) {
            // create a notification
            await NotificationModel.create({
                userId: req.user?._id,
                title: "New Question Reply Received",
                messaage: `You have a new question reply in ${courseContent?.title}`
            });
        }
        else {
            const data =
            {
                name: question.user.name,
                title: courseContent.title,
            }

            const html = await ejs.renderFile(path.join(__dirname, "../mails/questionReply.ejs",), data);

            try {
                await sendMail({
                    email: question.user.email,
                    subject: "Question Reply",
                    template: "questionReply.ejs",
                    data
                })
            }
            catch (err: any) {
                return next(new errorHandler(err.message, 400));
            }
        }
        res.status(200).json({
            success: true,
            message: "Answer Added Successfully",
            course: course
        })
    }
    catch (err) {
        return next(new errorHandler(err.message, 400));
    }
});

// add review in course

interface IAddReviewData {
    review: string;
    courseId: string;
    rating: string;
    userId: string;
}

export const addReview = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userCourseList = req.user?.courses;

        const courseID = req.params.id;

        //check if courseID is present in the course list of user
        const courseExists = userCourseList?.some((course: any) => course._id.toString());

        if (!courseExists) {
            return next(new errorHandler("You are not eligible to access this course!", 404));
        }

        const course = await CourseModel.findById(courseID);

        const { review, rating } = req.body as IAddReviewData;
        const reviewData: any = {
            user: req.user,
            comment: review,
            rating: rating
        }

        course?.reviews.push(reviewData);

        let avg = 0;

        course?.reviews.forEach((rev: any) => {
            avg += rev.rating;
        })

        if (course) {
            course.ratings = avg / course.reviews.length;
        }

        await course?.save();

        const notification = {
            title: "New review Received",
            messaage: `${req.user.name} has given a review in ${course?.name}`,
        }
        //create notification

        res.status(200).json({
            success: true,
            message: "Review Added Successfully",
            course: course
        })

    } catch (err) {
        return next(new errorHandler(err.message, 400));
    }
})

//add reply to the review
interface IAddReviewData {
    comment: string;
    courseId: string;
    reviewId: string;
}
export const addReplyToReview = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { comment, courseId, reviewId } = req.body as IAddReviewData;

        const course = await CourseModel.findById(courseId);

        if (!course) {
            return next(new errorHandler("Invalid course id", 400));
        }

        const review = course?.reviews?.find((item: any) => item._id.toString() === reviewId);

        if (!review) {
            return next(new errorHandler("Invalid review id", 400));
        }

        const replyData: any = {
            user: req.user,
            comment
        }

        if (!review.commenReplies) {
            review.commenReplies = [];
        }

        review.commenReplies?.push(replyData);

        await course?.save();

        res.status(200).json({
            success: true,
            message: "Reply Added Successfully",
            course: course
        })

    }
    catch (err) {
        return next(new errorHandler(err.message, 400));
    }
});

//get all courses --for admin only

export const getAllCoursesAdmin = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
       getAllCoursesService(res);
    }
    catch (err) {
        return next(new errorHandler(err.message, 400));
    }
})

// delete course --for admin only

export const deleteCourse = CatchAsyncError(async (req: Request, res: Response, next:NextFunction) =>{
    try{
        const {id} = req.params;

        const course = await CourseModel.findById(id);

        if(!course){
            return next(new errorHandler("Course No Found", 400));
        }

        await course.deleteOne({id});

        await redis.del(id);

        res.status(200).json({
            success: true,
            message: "Course Deleted Successfully"
        })
    }
    catch(err){
        return next(new errorHandler(err.message, 400));
    }
});

// generate video url

export const generateVideoUrl = CatchAsyncError(async(req: Request, res: Response, next:NextFunction)=>{
    try 
    {
        const {videoId} = req.body;
        const response = await axios.post(
            `https://dev.vdocipher.com/api/videos/${videoId}/otp`,
            {ttl:300},
            {
                headers:{
                    Accept:'application/json',
                    'Content-Type': 'application/json',
                    Authorization: `Apisecret ${process.env.VDOCIPHER_API_KEY}`
                }
            }    
        );

        res.json(response.data);

    } catch (e:any) {
        return next(new errorHandler(e.message,400));
    }
})