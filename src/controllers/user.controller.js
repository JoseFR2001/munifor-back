import UserModel from "../models/user.model.js";

export const getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await UserModel.findById(id);
    return res.status(200).json({
      ok: true,
      user,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      msg: "Error interno del servidor",
    });
  }
};

export const getWorkers = async (req, res) => {
  try {
    const workers = await UserModel.find({ role: "Trabajador" });
    return res.status(200).json({
      ok: true,
      workers,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      msg: "Error interno del servidor",
    });
  }
};

export const putIsActiveUser = async (req, res) => {
  const { id } = req.params;
  try {
    const updatedUser = await UserModel.findByIdAndUpdate(
      id,
      { is_active: true },
      { new: true }
    );
    return res.status(200).json({
      ok: true,
      user: updatedUser,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      msg: "Error interno del servidor",
    });
  }
};

// Rechazar usuario: setea deleted_at a la fecha actual
export const rejectUser = async (req, res) => {
  const { id } = req.params;
  try {
    const updatedUser = await UserModel.findByIdAndUpdate(
      id,
      { deleted_at: new Date() },
      { new: true }
    );
    return res.status(200).json({
      ok: true,
      user: updatedUser,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      msg: "Error interno del servidor",
    });
  }
};

export const getPendingUsers = async (req, res) => {
  try {
    const pendingUsers = await UserModel.find({
      is_active: false,
      deleted_at: null,
    });
    return res.status(200).json({
      ok: true,
      users: pendingUsers,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      msg: "Error interno del servidor",
    });
  }
};

// Al final del archivo, asegúrate que esté:
export const putIsAvailableUser = async (req, res) => {
  const { id } = req.params;
  try {
    const updatedUser = await UserModel.findByIdAndUpdate(
      id,
      { is_available: !req.body.is_available }, // Toggle o usar req.body.is_available
      { new: true }
    );
    return res.status(200).json({
      ok: true,
      user: updatedUser,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      msg: "Error interno del servidor",
    });
  }
};
