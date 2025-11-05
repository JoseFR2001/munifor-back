import { Router } from "express";
import { getUserById } from "../controllers/user.controller.js";

const userRoutes = Router();

userRoutes.get("/user/:id", getUserById);

export default userRoutes;
