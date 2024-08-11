import { Request, Response, NextFunction } from "express";
import errorHandler from "../utils/errorHandler";
import jwt, { JwtPayload } from 'jsonwebtoken'
import { CatchAsyncError } from "./catchAsyncError";
import { redis } from "../utils/redis";

//Authenticated User
export const isAuthenticated = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const access_token = req.cookies.access_token as string;

    if (!access_token) {
        return next(new errorHandler("Please Login to Access this Resources", 400));
    }

    const decoded = jwt.verify(access_token, process.env.ACCESS_TOKEN as string) as JwtPayload;

    if (!decoded) {
        return next(new errorHandler("access token is not valid", 400));
    }

    const user = await redis.get(decoded.id);

    if(!user)
    {
        return next(new errorHandler("Please Login to Access this resources", 400));
    }

    req.user = JSON.parse(user);

    next();
})

export const authorizeRoles = (...roles:string[])=>{
    return (req:Request, res:Response, next:NextFunction)=>{
        if(!roles.includes(req.user?.role || '')){
            return next(new errorHandler(`Role: ${req.user?.role} is not allowed to access this resources`,403))
        }
        next();
    }
}