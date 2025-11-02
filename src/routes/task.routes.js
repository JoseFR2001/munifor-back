import { Router } from "express";
import {
  createTask,
  deleteTask,
  getAllTasks,
  getTaskById,
  updateTask,
} from "../controllers/task.controller.js";

const taskRouter = Router();

taskRouter.post("/task", createTask);
taskRouter.get("/task", getAllTasks);
taskRouter.get("/task/:id", getTaskById);
taskRouter.put("/task/:id", updateTask);
taskRouter.delete("/task/:id", deleteTask);

export default taskRouter;
