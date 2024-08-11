"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const layout_controller_1 = require("../controllers/layout.controller");
const auth_1 = require("../middleware/auth");
const user_controller_1 = require("../controllers/user.controller");
const layoutRouter = express_1.default.Router();
layoutRouter.post("/create-layout", user_controller_1.updateAcceessToken, auth_1.isAuthenticated, (0, auth_1.authorizeRoles)("admin"), layout_controller_1.createLayout);
layoutRouter.post("/edit-layout", user_controller_1.updateAcceessToken, auth_1.isAuthenticated, (0, auth_1.authorizeRoles)("admin"), layout_controller_1.editLayout);
layoutRouter.get("/get-layout", user_controller_1.updateAcceessToken, layout_controller_1.getLayoutByType);
exports.default = layoutRouter;
