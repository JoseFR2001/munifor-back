//* ============================================
//* CONTROLADOR DE AUTENTICACIÓN
//* ============================================

//! IMPORTS DE HELPERS Y MODELOS
import { comparePassword, hashPassword } from "../helpers/bcrypt.helper.js";
import { generateToken } from "../helpers/jwt.helper.js";
import UserModel from "../models/user.model.js";

//* ============================================
//* REGISTRO DE NUEVOS USUARIOS
//* ============================================

/**
 * Registra un nuevo usuario en el sistema
 * - Los ciudadanos se activan automáticamente
 * - Otros roles requieren activación por administrador
 */
export const register = async (req, res) => {
  const { password } = req.body;
  try {
    //? Hashear la contraseña con bcrypt antes de guardarla
    const hashedPassword = await hashPassword(password);

    //? Preparar datos del usuario
    const userData = {
      ...req.body, // Todos los campos del body
      password: hashedPassword, // Reemplaza password plana con hasheada
      //! Si el rol es "Ciudadano", se activa automáticamente
      ...(req.body.role === "Ciudadano" ? { is_active: true } : {}),
    };

    //? Crear nuevo usuario en la base de datos
    const newUser = await UserModel.create(userData);

    //* Respuesta exitosa
    return res.status(201).json({
      ok: true,
      msg: "Usuario registrado exitosamente",
      user: newUser,
    });
  } catch (error) {
    //! Error en el servidor o datos duplicados (email/username)
    return res.status(500).json({
      ok: false,
      msg: "Error interno del servidor",
    });
  }
};

//* ============================================
//* INICIO DE SESIÓN (LOGIN)
//* ============================================

/**
 * Autentica un usuario y devuelve un token JWT
 * Validaciones:
 * 1. Usuario existe
 * 2. Contraseña correcta
 * 3. Cuenta está activada
 */
export const login = async (req, res) => {
  const { username, password } = req.body;
  try {
    //? Buscar usuario por username
    // IMPORTANTE: Necesitamos .select("+password") porque password tiene select: false
    const user = await UserModel.findOne({ username }).select("+password");

    //! Si no existe el usuario
    if (!user) {
      return res.status(404).json({
        ok: false,
        msg: "Credenciales inválidas", // Mensaje genérico por seguridad
      });
    }

    //? Comparar contraseña ingresada con la hasheada en BD
    const passwordExist = await comparePassword(password, user.password);

    //! Si la contraseña no coincide
    if (!passwordExist) {
      return res.status(401).json({
        ok: false,
        msg: "Credenciales inválidas", // Mensaje genérico por seguridad
      });
    }

    //! Verificar que el usuario esté activado
    if (!user.is_active) {
      return res.status(403).json({
        ok: false,
        msg: "Tu cuenta aún no ha sido activada por un administrador.",
      });
    }

    //? Generar token JWT con información del usuario
    // El token contiene: _id y role (encriptados)
    const token = generateToken({ _id: user._id, role: user.role });

    //* Respuesta exitosa con token
    return res.json({
      ok: true,
      message: "Login exitoso",
      token, // El frontend guarda este token para futuras peticiones
    });
  } catch (error) {
    console.error(error);
    //! Error del servidor
    return res.status(500).json({
      ok: false,
      msg: "Error interno del servidor",
    });
  }
};

//* ============================================
//* ACTUALIZAR PERFIL DE USUARIO
//* ============================================

/**
 * Actualiza los datos del perfil del usuario logueado
 * Solo actualiza campos dentro del objeto "profile"
 */
export const updateProfile = async (req, res) => {
  const userId = req.user._id; // ID del usuario autenticado (viene del middleware)
  try {
    console.log(userId);
    console.log({ profile: { ...req.body } });

    //? Actualizar solo el objeto profile con los nuevos datos
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { profile: { ...req.body } }, // Reemplaza todo el objeto profile
      {
        new: true, // Devuelve el documento actualizado
      }
    );

    //* Respuesta exitosa con usuario actualizado
    return res.json({
      ok: true,
      msg: "Perfil actualizado exitosamente",
      user: updatedUser,
    });
  } catch (error) {
    //! Error del servidor
    return res.status(500).json({
      ok: false,
      msg: "Error interno del servidor",
    });
  }
};

//* ============================================
//* CERRAR SESIÓN (LOGOUT)
//* ============================================

/**
 * Cierra la sesión del usuario
 * En sistemas JWT stateless, esto solo limpia la cookie
 * El frontend debe eliminar el token de localStorage
 */
export const logout = (req, res) => {
  //? Limpiar cookie de token (si se usa)
  res.clearCookie("token");

  //* Respuesta exitosa
  return res.status(200).json({ ok: true, msg: "Logout exitoso" });
};

//* ============================================
//* TRADUCCIÓN DE CONSTANTES
//* ============================================
// register = registrar
// login = iniciar sesión
// logout = cerrar sesión
// updateProfile = actualizar perfil
// hashPassword = hashear/cifrar contraseña
// comparePassword = comparar contraseña
// generateToken = generar token
// username = nombre de usuario
// password = contraseña
// hashedPassword = contraseña hasheada/cifrada
// is_active = está activo
// token = token de autenticación (JWT)
// req = request (petición HTTP)
// res = response (respuesta HTTP)
// ok = correcto/exitoso
// msg = mensaje
// user = usuario
// userData = datos del usuario
// userId = ID del usuario
