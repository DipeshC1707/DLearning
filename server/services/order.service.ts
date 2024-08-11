import { NextFunction, Response } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncError";
import OrderModel from "../modules/order.model";

//create a new order
export const newOrder = CatchAsyncError(async (data:any,res:Response) => {
    const order = await OrderModel.create(data);
    
    res.status(201).json({
        success:true,
        message:"Order created successfully",
        order
    });
}
)

//Get all the orders

export const getAllOrdersService = async(res:Response) => {
    const orders = await OrderModel.find().sort({createdAt:-1});

    res.status(201).json({
        success:true,
        message:"Orders fetched successfully",
        orders
    });
}