import { Router } from "express";
import { getUserById, getWorkers } from "../controllers/user.controller.js";

const userRoutes = Router();

userRoutes.get("/user/workers", getWorkers);
userRoutes.get("/user/:id", getUserById);

export default userRoutes;
