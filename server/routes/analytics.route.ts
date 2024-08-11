import express from "express";
import { authorizeRoles, isAuthenticated } from "../middleware/auth";
import { getAnalyticsData, getCoursesAnalyticsData, getOrdersAnalyticsData } from "../controllers/analyticsController";
import { updateAcceessToken } from "../controllers/user.controller";

const analyticsRouter = express.Router();

analyticsRouter.get('/get-users-analytics',updateAcceessToken, isAuthenticated,authorizeRoles("admin"),getAnalyticsData);

analyticsRouter.get('/get-courses-analytics',updateAcceessToken, isAuthenticated,authorizeRoles("admin"),getCoursesAnalyticsData);

analyticsRouter.get('/get-orders-analytics',updateAcceessToken, isAuthenticated,authorizeRoles("admin"),getOrdersAnalyticsData);

export default analyticsRouter;
