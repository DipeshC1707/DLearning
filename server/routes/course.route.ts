import express from "express";
import { addAnswer, addQuestion, addReplyToReview, addReview, deleteCourse, editCourse, generateVideoUrl, getAllCourses, getAllCoursesAdmin, getCourseByUser, getSingleCourse, uploadCourse } from "../controllers/course.controller";
import { authorizeRoles, isAuthenticated } from "../middleware/auth";
import { updateAcceessToken } from "../controllers/user.controller";
const courseRouter = express.Router();

courseRouter.post("/create-course",updateAcceessToken ,isAuthenticated,authorizeRoles("admin"),uploadCourse);

courseRouter.put("/edit-course/:id",updateAcceessToken,isAuthenticated,authorizeRoles("admin"),editCourse);

courseRouter.get("/get-course/:id",getSingleCourse);

courseRouter.get("/get-admin-courses",isAuthenticated,authorizeRoles("admin"),getAllCoursesAdmin)

courseRouter.get("/get-courses",getAllCourses);

courseRouter.get("/get-course-content/:id",updateAcceessToken,isAuthenticated,getCourseByUser);

courseRouter.put("/add-question",updateAcceessToken,isAuthenticated,addQuestion);

courseRouter.put("/add-answer",updateAcceessToken,isAuthenticated,addAnswer);

courseRouter.put("/add-review/:id",updateAcceessToken,isAuthenticated,addReview);

courseRouter.put("/add-reply",updateAcceessToken,isAuthenticated,authorizeRoles("admin"),addReplyToReview);

courseRouter.get("/get-courses-admin",updateAcceessToken,isAuthenticated,authorizeRoles("admin"),getAllCoursesAdmin);

courseRouter.delete("/delete-course/:id",updateAcceessToken,isAuthenticated,authorizeRoles("admin"),deleteCourse);

courseRouter.post("/getVdoCipherOTP",generateVideoUrl);

export default courseRouter;