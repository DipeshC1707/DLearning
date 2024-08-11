import mongoose, { Document, Model, Schema, trusted } from "mongoose";

export interface INotification extends Document{
    title: string;
    messaage: string;
    status: string;
    userId: string;
}

const notificationSchema = new Schema<INotification>({
    title: {
        type: String,
        required: true
    },
    messaage: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true,
        default: "unread"
    },
    userId: {
        type: String,
        required: true
    }
},{timestamps:true});

const NotificationModel : Model<INotification> = mongoose.model('Notification',notificationSchema);

export default NotificationModel;