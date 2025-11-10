import { comparePassword, hashPassword } from "../helpers/bcrypt.helper.js";
import { generateToken } from "../helpers/jwt.helper.js";
import UserModel from "../models/user.model.js";

export const register = async (req, res) => {
  const { password } = req.body;
  try {
    const hashedPassword = await hashPassword(password);
    const userData = {
      ...req.body,
      password: hashedPassword,
      ...(req.body.role === "Ciudadano" ? { is_active: true } : {}),
    };
    const newUser = await UserModel.create(userData);
    return res.status(201).json({
      ok: true,
      msg: "Usuario registrado exitosamente",
      user: newUser,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      msg: "Error interno del servidor",
    });
  }
};

export const login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await UserModel.findOne({ username });
    if (!user) {
      return res.status(404).json({
        ok: false,
        msg: "Credenciales inválidas",
      });
    }

    const passwordExist = await comparePassword(password, user.password);
    if (!passwordExist) {
      return res.status(401).json({
        ok: false,
        msg: "Credenciales inválidas",
      });
    }

    if (!user.is_active) {
      return res.status(403).json({
        ok: false,
        msg: "Tu cuenta aún no ha sido activada por un administrador.",
      });
    }

    const token = generateToken({ _id: user._id, role: user.role });

    return res.json({
      ok: true,
      message: "Login exitoso",
      token,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      ok: false,
      msg: "Error interno del servidor",
    });
  }
};
export const updateProfile = async (req, res) => {
  const userId = req.user._id;
  try {
    console.log(userId);
    console.log({ profile: { ...req.body } });
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { profile: { ...req.body } },
      {
        new: true,
      }
    );
    return res.json({
      ok: true,
      msg: "Perfil actualizado exitosamente",
      user: updatedUser,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      msg: "Error interno del servidor",
    });
  }
};

export const logout = (req, res) => {
  res.clearCookie("token");
  return res.status(200).json({ ok: true, msg: "Logout exitoso" });
};
