import { comparePassword, hashPassword } from "../helpers/bcrypt.helper.js";
import { generateToken } from "../helpers/jwt.helper.js";
import UserModel from "../models/user.model.js";

export const register = async (req, res) => {
  const { password, role } = req.body;
  try {
    const hashedPassword = await hashPassword(password);

    let userData;
    if (role == "Ciudadano") {
      userData = {
        ...req.body,
        password: hashedPassword,
        role_data: {
          is_banned: false,
          count_banned: 0,
          banned_at: null,
          banned_off: null,
        },
      };
    } else if (role == "Operador") {
      userData = {
        ...req.body,
        password: hashedPassword,
        role_data: {
          is_approved: false,
          approved_at: null,
          rejected_at: null,
          rejection_reason: null,
        },
      };
    } else if (role == "Trabajador") {
      userData = {
        ...req.body,
        password: hashedPassword,
        role_data: {
          is_approved: false,
          approved_at: null,
          rejected_at: null,
          rejection_reason: null,
          is_available: true,
          is_leader: false,
          leader_at: null,
        },
      };
    } else if (role == "Administrador") {
      userData = {
        ...req.body,
        password: hashedPassword,
        role_data: {},
      };
    } else {
      return res.status(400).json({
        ok: false,
        msg: "Rol inválido",
      });
    }

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

export const logout = (req, res) => {
  res.clearCookie("token");
  return res.status(200).json({ ok: true, msg: "Logout exitoso" });
};
