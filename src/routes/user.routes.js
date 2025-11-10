import { Router } from "express";
import {
  getUserById,
  getWorkers,
  getPendingUsers,
  rejectUser,
  putIsActiveUser,
  putIsAvailableUser,
  updateProfilePicture,
} from "../controllers/user.controller.js";
import { uploadProfilePicture } from "../config/multer.js";

const userRoutes = Router();

userRoutes.get("/user/workers", getWorkers);
userRoutes.get("/user/pending", getPendingUsers);
userRoutes.put("/user/reject/:id", rejectUser);
userRoutes.put("/user/activate/:id", putIsActiveUser);
userRoutes.put("/user/available/:id", putIsAvailableUser);
userRoutes.put(
  "/user/profile-picture/:id",
  uploadProfilePicture,
  updateProfilePicture
);
userRoutes.get("/user/:id", getUserById);

export default userRoutes;
