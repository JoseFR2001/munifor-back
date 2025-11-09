import { Router } from "express";
import {
  createTask,
  deleteTask,
  getAllTasks,
  getTaskById,
  getTaskOperator,
  getTaskWorker,
  updateTask,
} from "../controllers/task.controller.js";

const taskRouter = Router();

taskRouter.post("/task", createTask);
taskRouter.get("/task", getAllTasks);
taskRouter.get("/task/worker", getTaskWorker);
taskRouter.get("/task/operator", getTaskOperator);
taskRouter.get("/task/:id", getTaskById);
taskRouter.put("/task/:id", updateTask);
taskRouter.delete("/task/:id", deleteTask);

export default taskRouter;
