import express from 'express';
import { authorizeRoles, isAuthenticated } from '../middleware/auth';
import { getNotification, updateNotificationStatus } from '../controllers/notification.controller';
import { updateAcceessToken } from '../controllers/user.controller';

const notificationRouter = express.Router();

notificationRouter.get('/get-all-notifications',updateAcceessToken,isAuthenticated,authorizeRoles("admin"),getNotification);

notificationRouter.put('/update-notification/:id',updateAcceessToken,isAuthenticated,authorizeRoles("admin"),updateNotificationStatus);

export default notificationRouter;