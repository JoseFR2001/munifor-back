import { Router } from "express";
import {
  login,
  logout,
  register,
  updateProfile,
} from "../controllers/auth.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const authRoutes = Router();

authRoutes.post("/auth/register", register);
authRoutes.post("/auth/login", login);
authRoutes.put("/auth/update/profile", authMiddleware, updateProfile);
authRoutes.post("/auth/logout", logout);

export default authRoutes;
