import bcrypt from "bcryptjs";
import { timeStamp } from "console";
import mongoose, { Document, Model, Schema } from "mongoose";
import jwt from 'jsonwebtoken'
const emailRegexPattern: RegExp = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/

export interface IUser extends Document {
    email: string;
    password: string;
    name: string;
    role: string;
    avatar: {
        url: string;
        public_id: string
    }
    isVerified: boolean;
    courses: Array<{ courseID: string }>
    comparePassword: (password: string) => Promise<boolean>;
    SignAccessToken:()=>string;
    SignRefreshToken:()=>string;
}

const userSchema: Schema<IUser> = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please enter your name"]
    },
    email: {
        type: String,
        required: [true, "Please enter your email"],
        validate: {
            validator: function (value: string) {
                return emailRegexPattern.test(value);
            },
            message: "Please enter a valid email",
        },
        unique: true,
    },
    password: {
        type: String,
        minLength: [6, "Please enter at least 6 characters"],
        select:false
    },
    avatar: {
        public_id: String,
        url: String,
    },
    role: {
        type: String,
        default: "user"
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    courses: [{
        courseID: String,
    }],
}, { timestamps: true })


//HashPassword

userSchema.pre<IUser>('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    this.password = await bcrypt.hash(this.password, 10);
    next();
})

// Sign Access Token 
userSchema.methods.SignAccessToken = function (){
    return jwt.sign({id:this._id},process.env.ACCESS_TOKEN || '',{
        expiresIn: '5m'
    })
}

//Sign Refresh Token

userSchema.methods.SignRefreshToken = function (){
    return jwt.sign({id:this._id},process.env.REFRESH_TOKEN || '',{
        expiresIn: '7d'
    })
}

//compare password
userSchema.methods.comparePassword = async function (password: string) {
    return await bcrypt.compare(password, this.password);
};

const userModel: Model<IUser> = mongoose.model('User', userSchema);
export default userModel;

