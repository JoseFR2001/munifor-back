import { comparePassword, hashPassword } from "../helpers/bcrypt.helper.js";
import { generateToken } from "../helpers/jwt.helper.js";
import UserModel from "../models/user.model.js";

export const register = async (req, res) => {
  const { password } = req.body;
  try {
    const hashedPassword = await hashPassword(password);
    const newUser = await UserModel.create({
      ...req.body,
      password: hashedPassword,
    });

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

    const token = generateToken({ _id: user._id, role: user.role });

    return res.json({ ok: true, message: "Login exitoso", token });
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
