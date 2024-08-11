import { activateUser, deleteUser, getAllUsers, getUserInfo, loginUser, logoutUser, registerUser, socialAuth, updateAcceessToken, updatePassword, updateUserInfo, updateUserRole, updateporfilePicture } from "../controllers/user.controller";
import express from 'express';
import { authorizeRoles, isAuthenticated } from "../middleware/auth";
const userRouter = express.Router();

userRouter.post('/registration', registerUser);

userRouter.post('/activate-user', activateUser);

userRouter.post('/login', loginUser);

userRouter.get('/logout', isAuthenticated,logoutUser);

userRouter.get('/refresh',updateAcceessToken);

userRouter.get('/me',updateAcceessToken,isAuthenticated, getUserInfo);

userRouter.post('/social-auth', socialAuth);

userRouter.put('/update-user-info',updateAcceessToken, isAuthenticated, updateUserInfo);

userRouter.put('/update-password',updateAcceessToken,isAuthenticated, updatePassword);

userRouter.put('/update-user-avatar',updateAcceessToken,isAuthenticated, updateporfilePicture);

userRouter.get('/get-all-users',updateAcceessToken,isAuthenticated,authorizeRoles("admin"),getAllUsers);

userRouter.put('/update-user-role',updateAcceessToken,isAuthenticated,authorizeRoles("admin"),updateUserRole);

userRouter.delete('/delete-user/:id',updateAcceessToken,isAuthenticated,authorizeRoles("admin"),deleteUser);

export default userRouter;