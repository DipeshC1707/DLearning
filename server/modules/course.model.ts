import mongoose,{Document,Model,Schema} from "mongoose";
import { title } from "process";
import { IUser } from "./user.model";


interface IComment extends Document {
    user:IUser;
    question:string;
    questionReplies?:IComment[];
}

interface IReview extends Document{
    user:IUser;
    rating:number;
    comment:string;
    commenReplies:IComment[];
}

interface ILink extends Document{
    title:string;
    url:string;
}

interface ICourseData extends Document{
    title:string;
    description:string;
    price:number;
    image:string;
    instructor:string;
    category:string;
    lessons:ILink[];
    reviews:IReview[];
}    

interface ICourseData extends Document{
    title:string;
    description:string;
    videoUrl:string;
    videoSection:string;
    videoLength:number;
    videoPlayer:string;
    links:ILink[];
    suggestions:string;
    comments:IComment[];
    questions:IComment[];
}

interface ICourse extends Document {
    name:string;
    description?:string;
    price:number;
    estimatedPrice?:number;
    thumbnail:object;
    tags:string;
    level:string;
    demoUrl:string;
    benefits:{title:string}[];
    prerequisites:{title:string}[];
    reviews:IReview[];
    courseData:ICourseData[];
    ratings?:number;
    purchased?:number;
}

const reviewSchema = new Schema<IReview>({
    user:Object,
    rating:{
        type:Number,
        default:0
    },
    comment:String,
    commenReplies:[Object]
});

const linkSchema = new Schema<ILink>({
    title:String,
    url:String
});

const commentSchema = new Schema<IComment>({
    user:Object,
    question:String,
    questionReplies:[Object]
});

const courseDataSchema = new Schema<ICourseData>({
    title:String,
    videoUrl:String,
    videoSection:String,
    videoLength:Number,
    videoPlayer:String,
    links:[linkSchema],
    description:String,
    suggestions:String,
    questions:[commentSchema]
});

const courseSchema =  new Schema<ICourse>({
    name:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        required:true
    },
    estimatedPrice:Number,
    thumbnail:{
        public_id:{
            type:String,
        },
        url:{
            type:String,
        }
    },
    tags:{
        type:String,
        required:true
    },
    level:{
        type:String,
        required:true
    },
    demoUrl:{
        type:String,
        required:true
    },
    benefits:[{title: String}],
    prerequisites:[{title: String}],
    reviews:[reviewSchema],
    courseData:[courseDataSchema],
    ratings:{
        type:Number,
        default:0
    },
    purchased:{
        type:Number,
        default:0
    }
},{timestamps:true});

const CourseModel : Model<ICourse> = mongoose.model('Course',courseSchema);

export default CourseModel;