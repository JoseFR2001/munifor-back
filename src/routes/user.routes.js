import { Router } from "express";
import {
  getUserById,
  getWorkers,
  getPendingUsers,
  rejectUser,
  putIsActiveUser,
  putIsAvailableUser,
} from "../controllers/user.controller.js";

const userRoutes = Router();

userRoutes.get("/user/workers", getWorkers);
userRoutes.get("/user/pending", getPendingUsers);
userRoutes.put("/user/reject/:id", rejectUser);
userRoutes.put("/user/activate/:id", putIsActiveUser);
userRoutes.put("/user/available/:id", putIsAvailableUser);
userRoutes.get("/user/:id", getUserById);

export default userRoutes;
