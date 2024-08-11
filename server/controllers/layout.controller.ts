import { Request, Response, NextFunction } from "express";
import errorHandler from "../utils/errorHandler";
import { CatchAsyncError } from "../middleware/catchAsyncError";
import cloudinary from "cloudinary";
import LayoutModel from "../modules/layout.model";
import { addAnswer } from "./course.controller";
//create layout 

export const createLayout = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { type } = req.body;
        const isTypeExist = await LayoutModel.findOne({ type });
        if (isTypeExist) {
            return next(new errorHandler(`${type} already exists`, 400));
        }
        if (type === "Banner") {
            const { image, title, subTitle } = req.body;
            const myCloud = await cloudinary.v2.uploader.upload(image, {
                folder: "layout",
            });
            const bannerData = {
                image: {
                    public_id: myCloud.public_id,
                    url: myCloud.secure_url
                },
                title,
                subTitle
            }
            await LayoutModel.create(bannerData);
        }

        if (type === "FAQ") {
            const { faq } = req.body;
            const faqItems = await Promise.all(
                faq.map(async (item: any) => {
                    return {
                        question: item.question,
                        answer: item.answer
                    }
                })
            );
            await LayoutModel.create({ type: "FAQ", faq: faqItems });
        }

        if (type == "Categories") {
            const { categories } = req.body;
            const categoriesItems = await Promise.all(
                categories.map(async (item: any) => {
                    return {
                        title: item.title,
                    }
                })
            );
            await LayoutModel.create({ type: "Categories", categories: categoriesItems });
        }

        res.status(201).json({
            success: true,
            message: "Layout created successfully"
        });
    }
    catch (err) {
        return next(new errorHandler(err.message, 500));
    }
});


//edit layout

export const editLayout = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { type } = req.body;

        if (type === "Banner") {
            const bannerData:any = await LayoutModel.findOne({ type: "Banner"})
            const { image, title, subTitle } = req.body;
            if(bannerData){
                await cloudinary.v2.uploader.destroy(bannerData.image.public_id);
            }

            const myCloud = await cloudinary.v2.uploader.upload(image, {
                folder: "layout",
            });
            const banner = {
                image: {
                    public_id: myCloud.public_id,
                    url: myCloud.secure_url
                },
                title,
                subTitle
            }
            await LayoutModel.findByIdAndUpdate(bannerData?._id,{banner});
        }

        if (type === "FAQ") {
            const faqData = await LayoutModel.findOne({type:"FAQ"});
            const { faq } = req.body;
            const faqItems = await Promise.all(
                faq.map(async (item: any) => {
                    return {
                        question: item.question,
                        answer: item.answer
                    }
                })
            );
            await LayoutModel.findByIdAndUpdate(faqData?._id,{ type: "FAQ", faq: faqItems });
        }

        if (type == "Categories") {
            const { categories } = req.body;
            const categoriesData = await LayoutModel.findOne({type:"Categories"});
            const categoriesItems = await Promise.all(
                categories.map(async (item: any) => {
                    return {
                        title: item.title,
                    }
                })
            );
            await LayoutModel.findByIdAndUpdate(categoriesData?._id,{ type: "Categories", categories: categoriesItems });
        }

        res.status(201).json({
            success: true,
            message: "Layout updated successfully"
        });
    } catch (err) {
        return next(new errorHandler(err.message, 500));   
    }
});

// get layout by type

export const getLayoutByType = CatchAsyncError(async(req:Request, res:Response, next:NextFunction)=>{
    try {
        const {type} = req.body;
        const layout = await LayoutModel.findOne({type});
        res.status(200).json({
            success: true,
            layout
        })

    } catch (err) 
    {
        return next(new errorHandler(err.message, 500));
    }
})
