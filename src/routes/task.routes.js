//* ============================================
//* RUTAS DE TAREAS
//* ============================================

//! IMPORTS DE DEPENDENCIAS
import { Router } from "express";

//! IMPORTS DE CONTROLADORES
import {
  acceptTask,
  createTask,
  deleteTask,
  getAllTasks,
  getTaskById,
  getTaskOperator,
  getTaskWorker,
  updateTask,
} from "../controllers/task.controller.js";

//* CREACIÓN DEL ROUTER
const taskRouter = Router();

//* ============================================
//* DEFINICIÓN DE RUTAS
//* ============================================

//? POST /api/task - Crear nueva tarea
// Solo operadores pueden crear tareas
// Body: { title, crew, report[], priority, task_type, location }
// Responde: { ok, task }
taskRouter.post("/task", createTask);

//? GET /api/task - Obtener todas las tareas
// Para administradores
// Responde: { ok, tasks[] }
taskRouter.get("/task", getAllTasks);

//? GET /api/task/worker - Obtener tareas de la cuadrilla del trabajador
// Usa req.user._id para encontrar la cuadrilla
// Responde: { ok, crew, tasks[] }
taskRouter.get("/task/worker", getTaskWorker);

//? GET /api/task/operator - Obtener tareas creadas por el operador
// Usa req.user._id como assigned_operator
// Responde: { ok, tasks[] }
taskRouter.get("/task/operator", getTaskOperator);

//? GET /api/task/:id - Obtener tarea por ID
// Params: id
// Responde: { ok, task }
taskRouter.get("/task/:id", getTaskById);

//? PUT /api/task/assign/:id - Aceptar/iniciar tarea
// Cambia status a "En Progreso"
// El líder de la cuadrilla acepta la tarea
// Params: id
// Responde: { ok, task }
taskRouter.put("/task/assign/:id", acceptTask);

//? PUT /api/task/:id - Actualizar tarea
// Params: id
// Body: { title?, priority?, status?, etc. }
// Responde: { ok, task }
taskRouter.put("/task/:id", updateTask);

//? DELETE /api/task/:id - Eliminar tarea (hard delete)
// Params: id
// Responde: { ok, msg }
taskRouter.delete("/task/:id", deleteTask);

//* EXPORTAR EL ROUTER
export default taskRouter;

//* ============================================
//* TRADUCCIÓN DE CONSTANTES
//* ============================================
// taskRouter = enrutador de tareas
// createTask = crear tarea
// getAllTasks = obtener todas las tareas
// getTaskWorker = obtener tareas del trabajador
// getTaskOperator = obtener tareas del operador
// getTaskById = obtener tarea por ID
// acceptTask = aceptar/iniciar tarea
// updateTask = actualizar tarea
// deleteTask = eliminar tarea
// assign = asignar/aceptar
// worker = trabajador
// operator = operador
