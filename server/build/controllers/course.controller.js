"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateVideoUrl = exports.deleteCourse = exports.getAllCoursesAdmin = exports.addReplyToReview = exports.addReview = exports.addAnswer = exports.addQuestion = exports.getCourseByUser = exports.getAllCourses = exports.getSingleCourse = exports.editCourse = exports.uploadCourse = void 0;
const catchAsyncError_1 = require("../middleware/catchAsyncError");
const errorHandler_1 = __importDefault(require("../utils/errorHandler"));
const cloudinary_1 = __importDefault(require("cloudinary"));
const course_service_1 = require("../services/course.service");
const course_model_1 = __importDefault(require("../modules/course.model"));
const redis_1 = require("../utils/redis");
const mongoose_1 = __importDefault(require("mongoose"));
const path_1 = __importDefault(require("path"));
const ejs_1 = __importDefault(require("ejs"));
const sendMail_1 = __importDefault(require("../utils/sendMail"));
const notification_model_1 = __importDefault(require("../modules/notification.model"));
const axios_1 = __importDefault(require("axios"));
//upload course
exports.uploadCourse = (0, catchAsyncError_1.CatchAsyncError)(async (req, res, next) => {
    try {
        const data = req.body;
        const thumbnail = data.thumbnail;
        if (thumbnail) {
            const mycloud = await cloudinary_1.default.v2.uploader.upload(thumbnail, {
                folder: "cources"
            });
            data.thumbnail = {
                public_id: mycloud.public_id,
                url: mycloud.secure_url
            };
        }
        (0, course_service_1.createCourse)(data, res, next);
    }
    catch (err) {
        return next(new errorHandler_1.default(err.message, 500));
    }
});
//edit course
exports.editCourse = (0, catchAsyncError_1.CatchAsyncError)(async (req, res, next) => {
    try {
        const data = req.body;
        const thumbnail = data.thumbnail;
        if (thumbnail) {
            const mycloud = await cloudinary_1.default.v2.uploader.upload(thumbnail, {
                folder: "cources"
            });
            data.thumbnail = {
                public_id: mycloud.public_id,
                url: mycloud.secure_url
            };
        }
        console.log(data);
        const courseID = req.params.id;
        const course = await course_model_1.default.findByIdAndUpdate(courseID, { $set: data }, { new: true });
        res.status(200).json({
            success: true,
            message: "Course Updated Successfully",
            course: course
        });
    }
    catch (err) {
        return next(new errorHandler_1.default(err.message, 500));
    }
});
//get single course without purchasing
exports.getSingleCourse = (0, catchAsyncError_1.CatchAsyncError)(async (req, res, next) => {
    try {
        const courseID = req.params.id;
        const isCacheExists = await redis_1.redis.get(courseID);
        if (isCacheExists) {
            const course = JSON.parse(isCacheExists);
            res.status(200).json({
                success: true,
                message: "Course Retrieved Successfully",
                course: course
            });
        }
        else {
            const course = await course_model_1.default.findById(courseID).select("-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links ");
            await redis_1.redis.set(courseID, JSON.stringify(course));
            res.status(200).json({
                success: true,
                message: "Course Retrieved Successfully",
                course: course
            });
        }
    }
    catch (err) {
        return next(new errorHandler_1.default(err.message, 500));
    }
});
// get all courses without purchasing
exports.getAllCourses = (0, catchAsyncError_1.CatchAsyncError)(async (req, res, next) => {
    try {
        const courses = await course_model_1.default.find().select("-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links ");
        res.status(200).json({
            success: true,
            message: "Courses Retrieved Successfully",
            courses: courses
        });
    }
    catch (err) {
        return next(new errorHandler_1.default(err.message, 500));
    }
});
//get course content only for valid users
exports.getCourseByUser = (0, catchAsyncError_1.CatchAsyncError)(async (req, res, next) => {
    try {
        const userCourseList = req.user?.courses;
        const courseID = req.params.id;
        const courseExists = userCourseList?.find((course) => course._id === courseID);
        if (!courseExists) {
            return next(new errorHandler_1.default("You are not eligible to access this course!", 404));
        }
        const course = await course_model_1.default.findById(courseID);
        const content = course?.courseData;
        res.status(200).json({
            success: true,
            message: "Course Content Retrieved Successfully",
            content: content
        });
    }
    catch (error) {
        return next(new errorHandler_1.default(error.message, 500));
    }
});
exports.addQuestion = (0, catchAsyncError_1.CatchAsyncError)(async (req, res, next) => {
    try {
        const { question, courseId, contentId } = req.body;
        const course = await course_model_1.default.findById(courseId);
        if (!mongoose_1.default.Types.ObjectId.isValid(courseId)) {
            return next(new errorHandler_1.default("Invalid course id", 400));
        }
        const courseContent = course?.courseData?.find((item) => item._id.equals(contentId));
        if (!courseContent) {
            return next(new errorHandler_1.default("Invalid content id", 400));
        }
        // create a new question object
        const newQuestion = {
            user: req.user,
            question,
            questionReplies: []
        };
        // add this question to the course content
        courseContent.questions.push(newQuestion);
        await notification_model_1.default.create({
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
        });
    }
    catch (err) {
        return next(new errorHandler_1.default(err.message, 400));
    }
});
exports.addAnswer = (0, catchAsyncError_1.CatchAsyncError)(async (req, res, next) => {
    try {
        const { answer, courseId, contentId, questionId } = req.body;
        const course = await course_model_1.default.findById(courseId);
        if (!mongoose_1.default.Types.ObjectId.isValid(courseId)) {
            return next(new errorHandler_1.default("Invalid course id", 400));
        }
        const courseContent = course?.courseData?.find((item) => item._id.equals(contentId));
        if (!courseContent) {
            return next(new errorHandler_1.default("Invalid content id", 400));
        }
        const question = courseContent?.questions?.find((item) => item._id.equals(questionId));
        if (!question) {
            return next(new errorHandler_1.default("Invalid question id", 400));
        }
        //create new answer object
        const newAnswer = {
            user: req.user,
            answer
        };
        //add answer to our course content
        question.questionReplies.push(newAnswer);
        await course?.save();
        if (req.user?._id === question.user._id) {
            // create a notification
            await notification_model_1.default.create({
                userId: req.user?._id,
                title: "New Question Reply Received",
                messaage: `You have a new question reply in ${courseContent?.title}`
            });
        }
        else {
            const data = {
                name: question.user.name,
                title: courseContent.title,
            };
            const html = await ejs_1.default.renderFile(path_1.default.join(__dirname, "../mails/questionReply.ejs"), data);
            try {
                await (0, sendMail_1.default)({
                    email: question.user.email,
                    subject: "Question Reply",
                    template: "questionReply.ejs",
                    data
                });
            }
            catch (err) {
                return next(new errorHandler_1.default(err.message, 400));
            }
        }
        res.status(200).json({
            success: true,
            message: "Answer Added Successfully",
            course: course
        });
    }
    catch (err) {
        return next(new errorHandler_1.default(err.message, 400));
    }
});
exports.addReview = (0, catchAsyncError_1.CatchAsyncError)(async (req, res, next) => {
    try {
        const userCourseList = req.user?.courses;
        const courseID = req.params.id;
        //check if courseID is present in the course list of user
        const courseExists = userCourseList?.some((course) => course._id.toString());
        if (!courseExists) {
            return next(new errorHandler_1.default("You are not eligible to access this course!", 404));
        }
        const course = await course_model_1.default.findById(courseID);
        const { review, rating } = req.body;
        const reviewData = {
            user: req.user,
            comment: review,
            rating: rating
        };
        course?.reviews.push(reviewData);
        let avg = 0;
        course?.reviews.forEach((rev) => {
            avg += rev.rating;
        });
        if (course) {
            course.ratings = avg / course.reviews.length;
        }
        await course?.save();
        const notification = {
            title: "New review Received",
            messaage: `${req.user.name} has given a review in ${course?.name}`,
        };
        //create notification
        res.status(200).json({
            success: true,
            message: "Review Added Successfully",
            course: course
        });
    }
    catch (err) {
        return next(new errorHandler_1.default(err.message, 400));
    }
});
exports.addReplyToReview = (0, catchAsyncError_1.CatchAsyncError)(async (req, res, next) => {
    try {
        const { comment, courseId, reviewId } = req.body;
        const course = await course_model_1.default.findById(courseId);
        if (!course) {
            return next(new errorHandler_1.default("Invalid course id", 400));
        }
        const review = course?.reviews?.find((item) => item._id.toString() === reviewId);
        if (!review) {
            return next(new errorHandler_1.default("Invalid review id", 400));
        }
        const replyData = {
            user: req.user,
            comment
        };
        if (!review.commenReplies) {
            review.commenReplies = [];
        }
        review.commenReplies?.push(replyData);
        await course?.save();
        res.status(200).json({
            success: true,
            message: "Reply Added Successfully",
            course: course
        });
    }
    catch (err) {
        return next(new errorHandler_1.default(err.message, 400));
    }
});
//get all courses --for admin only
exports.getAllCoursesAdmin = (0, catchAsyncError_1.CatchAsyncError)(async (req, res, next) => {
    try {
        (0, course_service_1.getAllCoursesService)(res);
    }
    catch (err) {
        return next(new errorHandler_1.default(err.message, 400));
    }
});
// delete course --for admin only
exports.deleteCourse = (0, catchAsyncError_1.CatchAsyncError)(async (req, res, next) => {
    try {
        const { id } = req.params;
        const course = await course_model_1.default.findById(id);
        if (!course) {
            return next(new errorHandler_1.default("Course No Found", 400));
        }
        await course.deleteOne({ id });
        await redis_1.redis.del(id);
        res.status(200).json({
            success: true,
            message: "Course Deleted Successfully"
        });
    }
    catch (err) {
        return next(new errorHandler_1.default(err.message, 400));
    }
});
// generate video url
exports.generateVideoUrl = (0, catchAsyncError_1.CatchAsyncError)(async (req, res, next) => {
    try {
        const { videoId } = req.body;
        const response = await axios_1.default.post(`https://dev.vdocipher.com/api/videos/${videoId}/otp`, { ttl: 300 }, {
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: `Apisecret ${process.env.VDOCIPHER_API_KEY}`
            }
        });
        res.json(response.data);
    }
    catch (e) {
        return next(new errorHandler_1.default(e.message, 400));
    }
});
