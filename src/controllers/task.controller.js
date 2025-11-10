import CrewModel from "../models/crew.model.js";
import TaskModel from "../models/task.model.js";

export const createTask = async (req, res) => {
  const operatorId = req.user._id;
  try {
    const newTask = await TaskModel.create({
      ...req.body,
      assigned_operator: operatorId,
    });
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
  const workerId = req.user._id;
  try {
    console.log(workerId);
    const crew = await CrewModel.findOne({
      $or: [{ members: workerId }, { leader: workerId }],
      deleted_at: null,
    });
    if (!crew)
      return res.status(400).json({ ok: false, msg: "La cuadrilla no existe" });

    const tasks = await TaskModel.find({ crew: crew._id });

    return res.status(200).json({
      ok: true,
      crew: crew,
      tasks,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      ok: false,
      msg: "Error interno del servidor",
    });
  }
};

export const getTaskOperator = async (req, res) => {
  const operatorId = req.user._id;
  try {
    const tasks = await TaskModel.find({ assigned_operator: operatorId });
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

//Tarea aceptada
export const acceptTask = async (req, res) => {
  const { id } = req.params;
  try {
    const acceptedTask = await TaskModel.findByIdAndUpdate(
      id,
      { status: "En Progreso" },
      { new: true }
    );
    return res.status(200).json({
      ok: true,
      task: acceptedTask,
    });
  } catch (error) {
    console.log(error);
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
