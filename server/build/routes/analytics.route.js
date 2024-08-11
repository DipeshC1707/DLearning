"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const analyticsController_1 = require("../controllers/analyticsController");
const user_controller_1 = require("../controllers/user.controller");
const analyticsRouter = express_1.default.Router();
analyticsRouter.get('/get-users-analytics', user_controller_1.updateAcceessToken, auth_1.isAuthenticated, (0, auth_1.authorizeRoles)("admin"), analyticsController_1.getAnalyticsData);
analyticsRouter.get('/get-courses-analytics', user_controller_1.updateAcceessToken, auth_1.isAuthenticated, (0, auth_1.authorizeRoles)("admin"), analyticsController_1.getCoursesAnalyticsData);
analyticsRouter.get('/get-orders-analytics', user_controller_1.updateAcceessToken, auth_1.isAuthenticated, (0, auth_1.authorizeRoles)("admin"), analyticsController_1.getOrdersAnalyticsData);
exports.default = analyticsRouter;
