"use strict";
//get user by id
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserRoleService = exports.getAllUsersService = exports.getUserById = void 0;
const user_model_1 = __importDefault(require("../modules/user.model"));
const redis_1 = require("../utils/redis");
const getUserById = async (id, res) => {
    const userJSON = await redis_1.redis.get(id);
    if (userJSON) {
        const user = JSON.parse(userJSON);
        res.status(201).json({
            success: true,
            user
        });
    }
};
exports.getUserById = getUserById;
// Get All Users
exports.getAllUsersService = (async (res) => {
    const users = await user_model_1.default.find().sort({ createdAt: -1 });
    res.status(201).json({
        success: true,
        message: "Users fetched successfully",
        users: users
    });
});
// update role
exports.updateUserRoleService = (async (res, id, role) => {
    const user = await user_model_1.default.findByIdAndUpdate(id, { role }, { new: true });
    // user.role = role;
    res.status(201).json({
        success: true,
        message: "User role updated successfully",
        user: user
    });
});
