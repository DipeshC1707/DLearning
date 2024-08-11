import express from "express";
export const app = express();
import cookieParser from "cookie-parser";
import cors from "cors";
import { ErrorMiddleware } from "./middleware/error";
import userRouter from "./routes/user.route";
import courseRouter from "./routes/course.route";
import orderRouter from "./routes/order.route";
import notificationRouter from "./routes/notification.route";
import analyticsRouter from "./routes/analytics.route";
import layoutRouter from "./routes/layout.route";
require('dotenv').config();

//bodyparser
app.use(express.json({ limit: "50Mb" }));

//cookieparser
app.use(cookieParser());

//cors=>cross origin resources sharing
app.use(cors({
    origin: ["http://localhost:3000"],
    credentials: true
}))

//routes
app.use("/api/v1", userRouter, courseRouter, orderRouter, notificationRouter, analyticsRouter, layoutRouter);

//testing api
app.get("/test", (req, res, next) => {
    res.status(200).json({
        success: true,
        message: "API is working"
    })
})

//unknown route
app.all("*", (req, res, next) => {
    const err = new Error(`Route ${req.originalUrl} not found`) as any;
    err.statusCode = 404;
    next(err);
})

app.use(ErrorMiddleware);