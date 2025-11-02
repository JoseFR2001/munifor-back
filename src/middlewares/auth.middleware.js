import { verifyToken } from "../helpers/jwt.helper.js";

export const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];

    if (!authHeader) {
      return res.status(401).json({ msg: "No autenticado" });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ msg: "No autenticado" });
    }

    const decoded = verifyToken(token);

    req.user = decoded;
    next();
  } catch (error) {
    console.log(error.message);
    res.status(401).json({ msg: "Error interno del servidor" });
  }
};
