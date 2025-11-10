# 📋 PRESENTACIÓN SIMPLIFICADA - BACKEND MuniFor

## 🎯 Objetivo

Este documento define los **endpoints mínimos** necesarios en el backend para la presentación universitaria, enfocándonos en el **flujo principal** ciudadano-operador.

---

## ✅ ENDPOINTS OBLIGATORIOS PARA LA PRESENTACIÓN

### 🔐 1. AUTENTICACIÓN

#### POST /api/auth/register

**Descripción:** Registrar nuevo usuario (Ciudadano u Operador)

**Body:**

```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "confirmpassword": "string",
  "role": "Ciudadano" | "Operador",
  "profile": {
    "first_name": "string",
    "last_name": "string",
    "age": number,
    "dni": "string",
    "phone": "string",
    "address": "string",
    "sex": "Masculino" | "Femenino" | "Otro"
  }
}
```

**Response (201):**

```json
{
  "ok": true,
  "msg": "Usuario registrado exitosamente",
  "user": {
    "_id": "string",
    "username": "string",
    "email": "string",
    "role": "string"
  }
}
```

---

#### POST /api/auth/login

**Descripción:** Iniciar sesión y obtener token JWT

**Body:**

```json
{
  "username": "string",
  "password": "string"
}
```

**Response (200):**

```json
{
  "ok": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "string",
    "username": "string",
    "role": "string"
  }
}
```

**Response (401):**

```json
{
  "ok": false,
  "msg": "Credenciales inválidas"
}
```

---

### 📋 2. REPORTES (CIUDADANO)

#### POST /api/report

**Descripción:** Crear nuevo reporte (requiere autenticación)

**Headers:**

```
Authorization: Bearer <token>
```

**Body:**

```json
{
  "title": "string",
  "description": "string",
  "type_report": "Bache" | "Alumbrado" | "Basura" | "Incidente" | "Otro",
  "other_type_detail": "string",  // Solo si type_report === "Otro"
  "location": {
    "lat": number,
    "lng": number
  }
}
```

**Response (201):**

```json
{
  "ok": true,
  "msg": "Reporte creado exitosamente",
  "report": {
    "_id": "string",
    "title": "string",
    "description": "string",
    "type_report": "string",
    "location": {
      "lat": number,
      "lng": number
    },
    "status": "Pendiente",
    "author": "userId",
    "created_at": "2025-11-10T12:00:00.000Z"
  }
}
```

---

#### GET /api/reports/author

**Descripción:** Obtener reportes del usuario autenticado

**Headers:**

```
Authorization: Bearer <token>
```

**Response (200):**

```json
{
  "ok": true,
  "reports": [
    {
      "_id": "string",
      "title": "string",
      "description": "string",
      "type_report": "string",
      "status": "Pendiente" | "Revisado" | "Aceptado" | "Rechazado",
      "location": {
        "lat": number,
        "lng": number
      },
      "created_at": "2025-11-10T12:00:00.000Z"
    }
  ]
}
```

---

### 👨‍💼 3. REPORTES (OPERADOR)

#### GET /api/reports

**Descripción:** Obtener todos los reportes (solo Operador)

**Headers:**

```
Authorization: Bearer <token>
```

**Query params (opcional):**

```
?status=Pendiente
?type_report=Bache
```

**Response (200):**

```json
{
  "ok": true,
  "reports": [
    {
      "_id": "string",
      "title": "string",
      "description": "string",
      "type_report": "string",
      "status": "string",
      "location": {
        "lat": number,
        "lng": number
      },
      "author": "userId",
      "author_name": "string",
      "created_at": "2025-11-10T12:00:00.000Z"
    }
  ]
}
```

---

#### PUT /api/report/review/:id

**Descripción:** Marcar reporte como revisado (solo Operador)

**Headers:**

```
Authorization: Bearer <token>
```

**Params:**

- `id`: ID del reporte

**Response (200):**

```json
{
  "ok": true,
  "msg": "Reporte marcado como revisado",
  "report": {
    "_id": "string",
    "status": "Revisado"
  }
}
```

---

#### PUT /api/report/accept/:id

**Descripción:** Aceptar reporte (solo Operador)

**Headers:**

```
Authorization: Bearer <token>
```

**Params:**

- `id`: ID del reporte

**Response (200):**

```json
{
  "ok": true,
  "msg": "Reporte aceptado",
  "report": {
    "_id": "string",
    "status": "Aceptado"
  }
}
```

---

#### PUT /api/report/reject/:id

**Descripción:** Rechazar reporte (solo Operador)

**Headers:**

```
Authorization: Bearer <token>
```

**Params:**

- `id`: ID del reporte

**Body (opcional):**

```json
{
  "reason": "string" // Motivo del rechazo
}
```

**Response (200):**

```json
{
  "ok": true,
  "msg": "Reporte rechazado",
  "report": {
    "_id": "string",
    "status": "Rechazado"
  }
}
```

---

### 📊 4. DASHBOARD (Opcional - Simplificado)

#### GET /api/dashboard/citizen

**Descripción:** Estadísticas básicas para ciudadano

**Headers:**

```
Authorization: Bearer <token>
```

**Response (200):**

```json
{
  "ok": true,
  "counts": {
    "totalReports": number,
    "pendingReports": number,
    "acceptedReports": number,
    "rejectedReports": number
  }
}
```

---

#### GET /api/dashboard/operator

**Descripción:** Estadísticas básicas para operador

**Headers:**

```
Authorization: Bearer <token>
```

**Response (200):**

```json
{
  "ok": true,
  "counts": {
    "totalReports": number,
    "newReports": number,
    "reviewedReports": number,
    "acceptedReports": number,
    "rejectedReports": number
  }
}
```

---

## ❌ ENDPOINTS QUE PODEMOS IGNORAR PARA LA PRESENTACIÓN

### 🗑️ Eliminar/No implementar:

```
❌ POST /api/task                    # Crear tareas (requiere Worker)
❌ GET /api/task                     # Listar tareas
❌ PUT /api/task/:id                 # Actualizar tareas
❌ DELETE /api/task/:id              # Eliminar tareas

❌ POST /api/crew                    # Crear equipos
❌ GET /api/crew                     # Listar equipos
❌ PUT /api/crew/:id                 # Actualizar equipos
❌ DELETE /api/crew/:id              # Eliminar equipos

❌ POST /api/progress-report         # Reportes de progreso
❌ GET /api/progress-report          # Listar progresos

❌ GET /api/user/pending             # Solicitudes pendientes (Admin)
❌ PUT /api/user/available/:id       # Aprobar usuario (Admin)
❌ PUT /api/user/reject/:id          # Rechazar usuario (Admin)

❌ GET /api/dashboard/admin          # Dashboard admin
❌ GET /api/admin/statistics         # Estadísticas admin

❌ POST /api/auth/forgot-password    # Recuperar contraseña
❌ PUT /api/auth/update-password     # Actualizar contraseña

❌ Upload de imágenes (Multer)       # Feature reciente, opcional
```

---

## 🗄️ MODELOS DE BASE DE DATOS

### User Model (Simplificado)

```javascript
{
  _id: ObjectId,
  username: String (único, requerido),
  email: String (único, requerido),
  password: String (hasheado, requerido),
  role: String (enum: ["Ciudadano", "Operador"]),
  profile: {
    first_name: String,
    last_name: String,
    age: Number,
    dni: String,
    phone: String,
    address: String,
    sex: String (enum: ["Masculino", "Femenino", "Otro"])
  },
  created_at: Date (default: Date.now),
  status: String (default: "available")
}
```

---

### Report Model (Simplificado)

```javascript
{
  _id: ObjectId,
  title: String (requerido, min: 5, max: 100),
  description: String (requerido, min: 10, max: 500),
  type_report: String (enum: ["Bache", "Alumbrado", "Basura", "Incidente", "Otro"]),
  other_type_detail: String (requerido si type_report === "Otro"),
  location: {
    lat: Number (requerido),
    lng: Number (requerido)
  },
  status: String (enum: ["Pendiente", "Revisado", "Aceptado", "Rechazado"], default: "Pendiente"),
  author: ObjectId (ref: "User", requerido),
  created_at: Date (default: Date.now),
  updated_at: Date
}
```

---

## 🔒 MIDDLEWARE DE AUTENTICACIÓN

### verifyToken.js

```javascript
const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({ ok: false, msg: "Token no proporcionado" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { _id, role }
    next();
  } catch (error) {
    return res.status(401).json({ ok: false, msg: "Token inválido" });
  }
};

module.exports = verifyToken;
```

---

### verifyRole.js

```javascript
const verifyRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        ok: false,
        msg: "No tienes permisos para realizar esta acción",
      });
    }
    next();
  };
};

module.exports = verifyRole;
```

---

## 🛣️ RUTAS SIMPLIFICADAS

### auth.routes.js

```javascript
const express = require("express");
const router = express.Router();
const { register, login } = require("../controllers/auth.controller");

router.post("/register", register);
router.post("/login", login);

module.exports = router;
```

---

### report.routes.js

```javascript
const express = require("express");
const router = express.Router();
const {
  createReport,
  getReportsByAuthor,
  getAllReports,
  reviewReport,
  acceptReport,
  rejectReport,
} = require("../controllers/report.controller");
const verifyToken = require("../middlewares/verifyToken");
const verifyRole = require("../middlewares/verifyRole");

// Rutas Ciudadano
router.post("/", verifyToken, createReport);
router.get("/author", verifyToken, getReportsByAuthor);

// Rutas Operador
router.get("/", verifyToken, verifyRole(["Operador"]), getAllReports);
router.put("/review/:id", verifyToken, verifyRole(["Operador"]), reviewReport);
router.put("/accept/:id", verifyToken, verifyRole(["Operador"]), acceptReport);
router.put("/reject/:id", verifyToken, verifyRole(["Operador"]), rejectReport);

module.exports = router;
```

---

### dashboard.routes.js (Opcional)

```javascript
const express = require("express");
const router = express.Router();
const {
  getCitizenStats,
  getOperatorStats,
} = require("../controllers/dashboard.controller");
const verifyToken = require("../middlewares/verifyToken");
const verifyRole = require("../middlewares/verifyRole");

router.get("/citizen", verifyToken, verifyRole(["Ciudadano"]), getCitizenStats);
router.get(
  "/operator",
  verifyToken,
  verifyRole(["Operador"]),
  getOperatorStats
);

module.exports = router;
```

---

## 🔧 CONFIGURACIÓN MÍNIMA

### .env

```env
# Puerto del servidor
PORT=3000

# MongoDB
MONGO_URI=mongodb://localhost:27017/munifor

# JWT
JWT_SECRET=tu_secret_key_super_segura_aqui
JWT_EXPIRE=7d

# CORS
FRONTEND_URL=http://localhost:5173
```

---

### server.js (Simplificado)

```javascript
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

// Middlewares
app.use(cors({ origin: process.env.FRONTEND_URL }));
app.use(express.json());

// Rutas
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/report", require("./routes/report.routes"));
app.use("/api/reports", require("./routes/report.routes")); // Alias
app.use("/api/dashboard", require("./routes/dashboard.routes"));

// Conexión MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB conectado"))
  .catch((err) => console.error("❌ Error MongoDB:", err));

// Servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
```

---

## 📊 ESTADOS DE REPORTE

### Estados permitidos:

```javascript
const REPORT_STATUSES = {
  PENDING: "Pendiente", // Reporte recién creado
  REVIEWED: "Revisado", // Operador lo revisó
  ACCEPTED: "Aceptado", // Operador lo aceptó
  REJECTED: "Rechazado", // Operador lo rechazó
};
```

### Flujo de estados:

```
Pendiente 🟡
    ↓
Revisado 🔵
    ↓
Aceptado ✅  o  Rechazado ❌
```

---

## 🧪 DATOS DE PRUEBA

### Script para crear usuarios de prueba:

```javascript
// scripts/seed.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
require("dotenv").config();

const seedUsers = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  // Limpiar usuarios existentes
  await User.deleteMany({});

  // Crear usuarios de prueba
  const password = await bcrypt.hash("12345678", 10);

  const users = [
    {
      username: "ciudadano",
      email: "ciudadano@test.com",
      password,
      role: "Ciudadano",
      profile: {
        first_name: "Juan",
        last_name: "Pérez",
        age: 30,
        dni: "12345678",
        phone: "3704123456",
        address: "Av. 25 de Mayo 123",
        sex: "Masculino",
      },
    },
    {
      username: "operador",
      email: "operador@test.com",
      password,
      role: "Operador",
      profile: {
        first_name: "María",
        last_name: "González",
        age: 28,
        dni: "87654321",
        phone: "3704654321",
        address: "Av. Gutnisky 456",
        sex: "Femenino",
      },
    },
  ];

  await User.insertMany(users);
  console.log("✅ Usuarios de prueba creados");
  process.exit(0);
};

seedUsers();
```

**Ejecutar:**

```bash
node scripts/seed.js
```

**Credenciales:**

- **Ciudadano:** `ciudadano@test.com` / `12345678`
- **Operador:** `operador@test.com` / `12345678`

---

## 🧪 TESTING CON POSTMAN

### Colección de pruebas:

```
1. Auth
   ├─ POST Register Ciudadano
   ├─ POST Register Operador
   ├─ POST Login Ciudadano
   └─ POST Login Operador

2. Reports (Ciudadano)
   ├─ POST Create Report
   └─ GET My Reports

3. Reports (Operador)
   ├─ GET All Reports
   ├─ PUT Review Report
   ├─ PUT Accept Report
   └─ PUT Reject Report

4. Dashboard
   ├─ GET Citizen Stats
   └─ GET Operator Stats
```

---

## 🚀 COMANDOS PARA LA PRESENTACIÓN

### Iniciar backend:

```bash
# Desarrollo
npm run dev

# Producción
npm start
```

### Variables de entorno verificadas:

```bash
✅ PORT=3000
✅ MONGO_URI configurado
✅ JWT_SECRET configurado
✅ FRONTEND_URL=http://localhost:5173
```

### Verificar que funciona:

```bash
# Health check
curl http://localhost:3000/api/health

# Debería responder:
{"ok": true, "msg": "API funcionando"}
```

---

## 📋 CHECKLIST PRE-PRESENTACIÓN

### 1 día antes:

- [ ] MongoDB corriendo
- [ ] Backend iniciado sin errores
- [ ] Usuarios de prueba creados
- [ ] Postman con requests funcionando
- [ ] CORS configurado para frontend
- [ ] .env con variables correctas
- [ ] Git push al repositorio

### Día de presentación:

- [ ] Iniciar MongoDB
- [ ] Iniciar backend (`npm run dev`)
- [ ] Verificar que responde (`curl localhost:3000`)
- [ ] Tener Postman abierto (plan B)
- [ ] Tener logs visibles (para debugging si falla)

---

## 🐛 ERRORES COMUNES Y SOLUCIONES

### Error: "MongoDB not connected"

```bash
# Solución: Iniciar MongoDB
mongod --dbpath /path/to/data
```

### Error: "Token inválido"

```javascript
// Verificar en JWT_SECRET en .env
// Asegurar que frontend y backend usan mismo secret
```

### Error: "CORS policy"

```javascript
// Verificar en server.js:
app.use(
  cors({
    origin: "http://localhost:5173", // URL del frontend
    credentials: true,
  })
);
```

### Error: "Role not authorized"

```javascript
// Verificar que el token tiene el role correcto
// Verificar middleware verifyRole en las rutas
```

---

## 📊 ESTRUCTURA DE ARCHIVOS BACKEND

```
backend/
├── .env                          # Variables de entorno
├── package.json                  # Dependencias
├── server.js                     # Entry point
├── controllers/
│   ├── auth.controller.js       # Login, Register
│   ├── report.controller.js     # CRUD reportes
│   └── dashboard.controller.js  # Estadísticas (opcional)
├── models/
│   ├── User.js                  # Modelo Usuario
│   └── Report.js                # Modelo Reporte
├── routes/
│   ├── auth.routes.js           # Rutas autenticación
│   ├── report.routes.js         # Rutas reportes
│   └── dashboard.routes.js      # Rutas dashboard
├── middlewares/
│   ├── verifyToken.js           # Verificar JWT
│   └── verifyRole.js            # Verificar permisos
└── scripts/
    └── seed.js                   # Datos de prueba
```

**Total: ~15 archivos** (backend simplificado)

---

## 🎯 ENDPOINTS RESUMEN

### Obligatorios (7 endpoints):

```
✅ POST   /api/auth/register         # Registro
✅ POST   /api/auth/login            # Login
✅ POST   /api/report                # Crear reporte
✅ GET    /api/reports/author        # Mis reportes
✅ GET    /api/reports               # Todos (Operador)
✅ PUT    /api/report/review/:id     # Revisar
✅ PUT    /api/report/accept/:id     # Aceptar
✅ PUT    /api/report/reject/:id     # Rechazar
```

### Opcionales (2 endpoints):

```
⚪ GET    /api/dashboard/citizen     # Stats ciudadano
⚪ GET    /api/dashboard/operator    # Stats operador
```

---

## 💡 TIPS PARA LA DEMOSTRACIÓN

### Antes de presentar:

1. ✅ Tener backend corriendo 30 min antes
2. ✅ Verificar logs sin errores
3. ✅ Probar login con usuarios de prueba
4. ✅ Crear 2-3 reportes de ejemplo
5. ✅ Tener Postman listo (plan B)

### Durante la demo:

1. **Mostrar logs en vivo** (transparencia)
2. **Explicar JWT** si preguntan
3. **Mostrar modelo de datos** en MongoDB Compass
4. **Tener Postman ready** por si frontend falla

### Si algo falla:

1. **Usar Postman** para demostrar que backend funciona
2. **Mostrar código** del endpoint que falla
3. **Explicar** la arquitectura mientras solucionas
4. **Mantener calma** - los errores pasan

---

## 🎓 PREGUNTAS FRECUENTES (Backend)

### P: ¿Por qué JWT y no sesiones?

**R:** "JWT es stateless, escalable, y el frontend puede almacenar el token fácilmente. No requiere mantener sesiones en el servidor."

### P: ¿Cómo manejan la seguridad de las contraseñas?

**R:** "Usamos bcrypt con 10 rounds de salt para hashear las contraseñas antes de guardarlas en MongoDB."

### P: ¿Validación de datos?

**R:** "Validamos en dos capas: frontend con Zod y backend con express-validator antes de guardar en base de datos."

### P: ¿Por qué MongoDB?

**R:** "Base de datos NoSQL flexible, fácil de escalar, y se integra bien con Node.js mediante Mongoose."

### P: ¿Cómo previenen inyección SQL?

**R:** "Usamos MongoDB que no es vulnerable a SQL injection, y además Mongoose sanitiza las queries automáticamente."

---

## 📦 DEPENDENCIAS MÍNIMAS

```json
{
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^8.0.0",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
```

**Opcional (si tiempo permite):**

```json
{
  "express-validator": "^7.0.1", // Validación
  "morgan": "^1.10.0" // Logging
}
```

---

## 🚀 SCRIPTS package.json

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "seed": "node scripts/seed.js"
  }
}
```

---

## ✅ CRITERIOS DE APROBACIÓN (Backend)

### Funcionalidad:

- ✅ Autenticación funciona (login/register)
- ✅ JWT se genera correctamente
- ✅ Crear reportes funciona
- ✅ Listar reportes funciona
- ✅ Cambiar estados funciona (revisar/aceptar/rechazar)

### Seguridad:

- ✅ Contraseñas hasheadas
- ✅ JWT válido y verificado
- ✅ Rutas protegidas con middleware
- ✅ Roles verificados

### Arquitectura:

- ✅ Código organizado (MVC)
- ✅ Middlewares separados
- ✅ Modelos definidos
- ✅ Rutas limpias

---

## 🎯 OBJETIVO FINAL

**Backend simplificado que:**

1. ✅ Autentica usuarios
2. ✅ Gestiona reportes
3. ✅ Diferencia roles (Ciudadano/Operador)
4. ✅ Funciona sin errores en demo
5. ✅ Código limpio y mantenible

**Nota esperada: 8-9/10** 🎯

---

**Última actualización:** 10 de noviembre de 2025
**Para usar junto con:** PRESENTACION-SIMPLIFICADA.md (Frontend)
**Tiempo de setup:** 1-2 horas
**¡Éxitos!** 🚀
