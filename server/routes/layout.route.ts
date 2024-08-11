import express from "express";
import { createLayout, editLayout, getLayoutByType } from "../controllers/layout.controller";
import { authorizeRoles, isAuthenticated } from "../middleware/auth";
import { updateAcceessToken } from "../controllers/user.controller";

const layoutRouter = express.Router();

layoutRouter.post("/create-layout",updateAcceessToken, isAuthenticated,authorizeRoles("admin"),createLayout);

layoutRouter.post("/edit-layout",updateAcceessToken, isAuthenticated,authorizeRoles("admin"),editLayout);

layoutRouter.get("/get-layout",updateAcceessToken,getLayoutByType);

export default layoutRouter;