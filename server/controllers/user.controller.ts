import { Request, Response, NextFunction } from "express";
import userModel, { IUser } from "../modules/user.model";
import errorHandler from "../utils/errorHandler";
import { CatchAsyncError } from "../middleware/catchAsyncError";
import jwt, { JwtPayload } from "jsonwebtoken";
import ejs, { name } from "ejs";
import path from "path";
import sendMail from "../utils/sendMail";
import { accessTokenOptions, refreshTokenOptions, sendToken } from "../utils/jwt";
import { redis } from "../utils/redis";
import { getAllUsersService, getUserById, updateUserRoleService } from "../services/user.service";
import { errorMonitor } from "events";
import cloudinary from "cloudinary";
require('dotenv').config();

//register user
interface IRegistrationBody {
    name: string;
    email: string;
    password: string;
    avatar?: string;
}

export const registerUser = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, email, password } = req.body;

        const isEmailExist = await userModel.findOne({ email });
        if (isEmailExist) {
            return next(new errorHandler("Email already Exist", 400));
        }

        const user: IRegistrationBody = {
            name,
            email,
            password
        }

        const activationToken = createActivationToken(user);

        const activationCode = activationToken.activationCode;

        const data = { user: { name: user.name }, activationCode };

        const html = ejs.renderFile(path.join(__dirname, "../mails/activationMail.ejs"), data);
        try {
            await sendMail({
                email: user.email,
                subject: "Account Activation",
                template: "activationMail.ejs",
                data
            });

            res.status(200).json({ success: true, message: `Please check your email: ${user.email} to activate your account!`, activationToken: activationToken.token });
        }
        catch (err: any) {
            return next(new errorHandler(err.message, 400));
        }
    } catch (error: any) {
        return next(new errorHandler(error.message, 400));
    }
});

interface IActivationToken {
    token: string;
    activationCode: string;
}

export const createActivationToken = (user: any): IActivationToken => {
    const activationCode = Math.floor(1000 + Math.random() * 9000).toString();
    const token = jwt.sign({
        user, activationCode
    }, process.env.ACTIVATION_SECRET_KEY, {
        expiresIn: '5m'
    });
    return {
        token,
        activationCode
    }
}

// activate user 

interface IActivationRequest {
    activation_code: string;
    activation_token: string;
}

export const activateUser = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { activation_code, activation_token } = req.body as IActivationRequest;

        const newUser: { user: IUser; activationCode: string } = jwt.verify(
            activation_token,
            process.env.ACTIVATION_SECRET_KEY as string
        ) as { user: IUser; activationCode: string; }

        if (newUser.activationCode !== activation_code) {
            return next(new errorHandler("Invalid activation code", 400));
        }

        const { name, email, password } = newUser.user;

        const existUser = await userModel.findOne({ email: email });

        if (existUser) {
            return next(new errorHandler("User already Exist", 400));
        }

        const user = await userModel.create({
            name: name,
            email: email,
            password: password
        });

        res.status(201).json({
            success: true
        })

    } catch (error) {
        return next(new errorHandler(error.message, 200));
    }
})

//login user

interface ILoginRequest {
    email: string;
    password: string;
}

export const loginUser = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body as ILoginRequest;

        if (!email || !password) {
            return next(new errorHandler("Please provide email and password", 400));
        };

        const user = await userModel.findOne({ email }).select("+password");

        if (!user) {
            return next(new errorHandler("Invalid email or password", 400));
        }

        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return next(new errorHandler("Invalid Password", 400));
        }

        sendToken(user, 200, res);

    } catch (err) {
        return new errorHandler(err.message, 400);
    }
});

export const logoutUser = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.cookie("access_token", "", { maxAge: 1 });
        res.cookie("refresh_token", "", { maxAge: 1 });
        const userID = req.user?._id || '';
        redis.del(userID);
        res.status(200).json({
            success: true,
            message: "Logged out successfully",
        });
    }
    catch (err) {
        return next(new errorHandler(err.message, 400));
    }
})

//update access token

export const updateAcceessToken = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const refresh_token = req.cookies.refresh_token as string;
        const decoded = jwt.verify(refresh_token, process.env.REFRESH_TOKEN as string) as JwtPayload;
        if (!decoded) {
            return next(new errorHandler("Invalid refresh token", 400));
        }
        const session = await redis.get(decoded.id as string);

        if (!session) {
            return next(new errorHandler("Please Login to access these resources", 400));
        }

        const user = JSON.parse(session);

        const accessToken = jwt.sign({
            id: user._id
        }, process.env.ACCESS_TOKEN as string, {
            expiresIn: '5m'
        });

        const refreshToken = jwt.sign({ id: user._id },
            process.env.REFRESH_TOKEN as string,
            { expiresIn: '3d' });

        req.user = user;

        res.cookie("access_token", accessToken, accessTokenOptions);
        res.cookie("refresh_token", refreshToken, refreshTokenOptions);

        await redis.set(user._id, JSON.stringify(user), "EX", 604800); //7days Expire

        next();
    }
    catch (error) {
        return next(new errorHandler(error.message, 400));
    }
});

// get user info

export const getUserInfo = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userID = req?.user._id
        getUserById(userID, res);
    } catch (error) {
        return next(new errorHandler(error.message, 400));
    }
})

interface ISOcialAuthBody {
    email: string;
    name: string;
    avatar: string;
}
//social auth

export const socialAuth = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, name, avatar } = req.body as ISOcialAuthBody;
        const user = await userModel.findOne({ email });
        if (!user) {
            const newUser = await userModel.create({
                email: email, name: name, avatar: avatar
            });
            sendToken(newUser, 200, res);
        }
        else {
            sendToken(user, 200, res);
        }
    }
    catch (err) {
        return next(new errorHandler(err.message, 400));
    }
})

//update user info

interface IUpdateUserInfo {
    name?: string;
}

export const updateUserInfo = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name } = req.body as IUpdateUserInfo;
        const userID = req.user?._id;
        const user = await userModel.findById(userID);


        if (name && user) {
            user.name = name;
        }

        await user?.save();

        await redis.set(userID, JSON.stringify(user));

        res.status(201).json({
            success: true,
            user: user
        })

    }
    catch (err) {

    }
})

//update user password
interface IUPdatePassword {
    oldPassword: string;
    newPassword: string;
}
export const updatePassword = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { oldPassword, newPassword } = req.body as IUPdatePassword;

        if (!oldPassword || !newPassword) {
            return next(new errorHandler("Enter old and new password", 400));
        }
        const user = await userModel.findById(req?.user._id).select("+password");

        if (user?.password === undefined) {
            return next(new errorHandler("Invalid User", 400));
        }

        const isPasswordMatch = await user?.comparePassword(oldPassword);

        if (!isPasswordMatch) {
            return next(new errorHandler("Invalid password", 400));
        }

        user.password = newPassword;

        await user.save();

        await redis.set(req?.user._id, JSON.stringify(user));

        res.status(201).json({
            success: true,
            user: user
        })

    }
    catch (err) {
        return next(new errorHandler(err.message, 400));
    }
})


//update profile picture or avatar

interface IUpdateProfilePicture {
    avatar: string;
}


export const updateporfilePicture = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { avatar } = req.body;

        const userID = req?.user?._id;

        const user = await userModel.findById(userID);

        if (avatar && user) {
            if (user?.avatar?.public_id) {
                //delete first old image
                await cloudinary.v2.uploader.destroy(user?.avatar?.public_id);

                const mycloud = await cloudinary.v2.uploader.upload(avatar, {
                    folder: "avatar",
                    width: 150
                });
                user.avatar = {
                    public_id: mycloud.public_id,
                    url: mycloud.secure_url
                }
            }
            else {
                const mycloud = await cloudinary.v2.uploader.upload(avatar, {
                    folder: "avatar",
                    width: 150
                });
                user.avatar = {
                    public_id: mycloud.public_id,
                    url: mycloud.secure_url
                }
            }
        }

        await user?.save();

        await redis.set(req?.user._id, JSON.stringify(user));

        res.status(201).json({
            success: true,
            user: user
        })

    }
    catch (err) {

    }
});


//get all users --only-for-admin

export const getAllUsers = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        getAllUsersService(res);
    }
    catch (err) {
        return next(new errorHandler(err.message, 400));
    }
})

// update user role -- only for admin

export const updateUserRole = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id, role } = req.body;
        updateUserRoleService(res, id, role);
    }
    catch (err) {
        return next(new errorHandler(err.message, 400));
    }
});

//Delete User --only admin

export const deleteUser = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const user = await userModel.findById(id);

        if (!user) {
            return next(new errorHandler("User not found", 404))
        }

        await user?.deleteOne({ id });

        await redis.del(id);

        res.status(201).json({
            success: true,
            message: "User deleted successfully",
            user: user
        });

    }
    catch (err) {
        return next(new errorHandler(err.message, 400));
    }
});