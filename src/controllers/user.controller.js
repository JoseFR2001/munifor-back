import UserModel from "../models/user.model.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// Actualizar foto de perfil
export const updateProfilePicture = async (req, res) => {
  const { id } = req.params;
  try {
    if (!req.file) {
      return res.status(400).json({
        ok: false,
        msg: "No se ha enviado ninguna imagen",
      });
    }

    // Obtener usuario actual para eliminar imagen anterior
    const user = await UserModel.findById(id);
    if (!user) {
      return res.status(404).json({
        ok: false,
        msg: "Usuario no encontrado",
      });
    }

    // Eliminar imagen anterior si existe
    if (user.profile_picture) {
      const oldImagePath = path.join(__dirname, "../../", user.profile_picture);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    // Guardar nueva ruta de imagen
    const imagePath = `uploads/profiles/${req.file.filename}`;
    const updatedUser = await UserModel.findByIdAndUpdate(
      id,
      { profile_picture: imagePath },
      { new: true }
    );

    return res.status(200).json({
      ok: true,
      user: updatedUser,
      imageUrl: `${req.protocol}://${req.get("host")}/${imagePath}`,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      msg: "Error interno del servidor",
    });
  }
};
