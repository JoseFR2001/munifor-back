import TaskModel from "../models/task.model.js";

export const createTask = async (req, res) => {
  try {
    const newTask = await TaskModel.create(req.body);
    return res.status(201).json({
      ok: true,
      task: newTask,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      msg: "Error interno del servidor",
    });
  }
};
export const getAllTasks = async (req, res) => {
  try {
    const tasks = await TaskModel.find();
    return res.status(200).json({
      ok: true,
      tasks,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      msg: "Error interno del servidor",
    });
  }
};
export const getTaskById = async (req, res) => {
  const { id } = req.params;
  try {
    const task = await TaskModel.findById(id);
    return res.status(200).json({
      ok: true,
      task,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      msg: "Error interno del servidor",
    });
  }
};

export const getTaskWorker = async (req, res) => {
  const { crewId } = req.params;
  // ! Debo modificar esto para que tome el id del user logueado
  try {
    const tasks = await TaskModel.find({ crew: crewId });
    return res.status(200).json({
      ok: true,
      tasks,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      msg: "Error interno del servidor",
    });
  }
};

export const updateTask = async (req, res) => {
  const { id } = req.params;
  try {
    const updatedTask = await TaskModel.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    return res.status(200).json({
      ok: true,
      task: updatedTask,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      msg: "Error interno del servidor",
    });
  }
};
export const deleteTask = async (req, res) => {
  const { id } = req.params;
  try {
    await TaskModel.findByIdAndDelete(id);
    return res.status(200).json({
      ok: true,
      msg: "Task deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      msg: "Error interno del servidor",
    });
  }
};
