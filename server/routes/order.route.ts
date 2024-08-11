import express from "express";
import { createOrder, getAllOrders } from "../controllers/order.controller";
import { authorizeRoles, isAuthenticated } from "../middleware/auth";
import { updateAcceessToken } from "../controllers/user.controller";

const orderRouter = express.Router();

orderRouter.post("/create-order",updateAcceessToken, isAuthenticated, createOrder);

orderRouter.get("/get-orders",updateAcceessToken, isAuthenticated, authorizeRoles("admin"), getAllOrders);

export default orderRouter;