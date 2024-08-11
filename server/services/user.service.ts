//get user by id

import { NextFunction, Response } from "express";
import userModel from "../modules/user.model";
import { redis } from "../utils/redis";
import { CatchAsyncError } from "../middleware/catchAsyncError";
import errorHandler from "../utils/errorHandler";
import { nextTick } from "process";

export const getUserById = async (id: string, res: Response) => {
    const userJSON = await redis.get(id);
    if (userJSON) {
        const user = JSON.parse(userJSON);
        res.status(201).json({
            success: true,
            user
        })
    }
}

// Get All Users

export const getAllUsersService = (async (res: Response) => {
    const users = await userModel.find().sort({ createdAt: -1 });

    res.status(201).json({
        success: true,
        message: "Users fetched successfully",
        users: users
    });
});

// update role

export const updateUserRoleService = (async (res: Response, id: string, role: string) => {
    const user = await userModel.findByIdAndUpdate(id, { role }, { new: true });

    // user.role = role;

    res.status(201).json({
        success: true,
        message: "User role updated successfully",
        user: user
    });

})

