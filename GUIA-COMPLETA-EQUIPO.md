# 📚 GUÍA COMPLETA DEL SISTEMA MUNIFOR - BACKEND

> **Guía para el equipo:** Este documento explica todo el funcionamiento del backend de MuniFor para que todos puedan entender y explicar el proyecto en la exposición.

---

## 📖 ÍNDICE

1. [Visión General del Sistema](#visión-general)
2. [Arquitectura y Estructura](#arquitectura)
3. [Modelos de Datos](#modelos)
4. [Sistema de Autenticación](#autenticación)
5. [Endpoints de la API](#endpoints)
6. [Funcionalidades Principales](#funcionalidades)
7. [Features Especiales](#features)
8. [Flujo de Trabajo Completo](#flujo)
9. [Mejoras Sugeridas](#mejoras)
10. [Preguntas Frecuentes](#faq)

---

## 🎯 VISIÓN GENERAL DEL SISTEMA {#visión-general}

### ¿Qué es MuniFor?

MuniFor es un sistema de **gestión de reportes municipales** donde:

- **Ciudadanos** reportan problemas (baches, alumbrado, basura, etc.)
- **Operadores** revisan, aceptan/rechazan reportes y crean tareas
- **Trabajadores** (líderes de cuadrilla) ejecutan tareas y reportan progreso
- **Administradores** gestionan usuarios, cuadrillas y ven estadísticas globales

### Tecnologías Utilizadas

```
Backend:
- Node.js v18+
- Express 5.1.0
- MongoDB + Mongoose 8.19.2
- JWT (jsonwebtoken 9.0.2)
- Bcrypt 6.0.0 (hash de contraseñas)
- Multer (subida de imágenes)
- Node-cron 4.2.1 (tareas programadas)
- CORS (seguridad)
- Express-validator 7.3.0
```

### Stack Completo

```
Frontend (React + Vite)
    ↓
Backend API (Express + Node.js)
    ↓
Base de Datos (MongoDB)
```

---

## 🏗️ ARQUITECTURA Y ESTRUCTURA {#arquitectura}

### Estructura de Carpetas

```
munifor-back/
│
├── app.js                      # Punto de entrada, configuración de Express
├── package.json                # Dependencias del proyecto
├── .env                        # Variables de entorno (NO SE SUBE A GIT)
│
├── scripts/
│   └── seed.js                 # Script para poblar la BD con datos de prueba
│
├── uploads/                    # Carpeta para imágenes (NO SE SUBE A GIT)
│   ├── profiles/               # Fotos de perfil
│   ├── reports/                # Imágenes de reportes
│   └── progress/               # Imágenes de progress reports
│
└── src/
    ├── config/
    │   ├── database.js         # Conexión a MongoDB
    │   └── multer.js           # Configuración de subida de imágenes
    │
    ├── models/                 # Esquemas de MongoDB (Mongoose)
    │   ├── user.model.js
    │   ├── report.model.js
    │   ├── task.model.js
    │   ├── crew.model.js
    │   └── progress_report.model.js
    │
    ├── controllers/            # Lógica de negocio
    │   ├── auth.controller.js
    │   ├── user.controller.js
    │   ├── report.controller.js
    │   ├── task.controller.js
    │   ├── crew.controller.js
    │   ├── progress_report.controller.js
    │   ├── dashboard.controller.js
    │   ├── statistics.controller.js
    │   └── map.controller.js
    │
    ├── routes/                 # Definición de endpoints
    │   ├── index.js            # Enrutador principal
    │   ├── auth.routes.js
    │   ├── user.routes.js
    │   ├── report.route.js
    │   ├── task.routes.js
    │   ├── crew.routes.js
    │   ├── progress_report.routes.js
    │   ├── dashboard.routes.js
    │   ├── statistics.routes.js
    │   └── map.routes.js
    │
    ├── middlewares/            # Funciones intermedias
    │   ├── auth.middleware.js  # Verificación de JWT
    │   ├── validator.js        # Validación de datos
    │   └── validations/
    │       ├── auth.middlewares.js
    │       ├── user.middlewares.js
    │       ├── report.middlewares.js
    │       ├── task.middleware.js
    │       └── crew.middlewares.js
    │
    ├── helpers/                # Funciones auxiliares
    │   ├── bcrypt.helper.js    # Encriptación de contraseñas
    │   └── jwt.helper.js       # Generación/verificación de tokens
    │
    └── jobs/                   # Tareas programadas
        └── auto_reject_reports.js  # Rechaza reportes antiguos
```

### Flujo de una Request

```
1. Cliente (Frontend) envía request
   ↓
2. Express recibe en app.js
   ↓
3. CORS permite el origen
   ↓
4. Entra a /api/... (routes/index.js)
   ↓
5. Si es ruta protegida → authMiddleware verifica JWT
   ↓
6. Middleware de validación (express-validator)
   ↓
7. Controller ejecuta lógica de negocio
   ↓
8. Model interactúa con MongoDB
   ↓
9. Controller responde al cliente con JSON
```

---

## 💾 MODELOS DE DATOS {#modelos}

### 1. User (Usuario)

**Propósito:** Almacena todos los usuarios del sistema (Ciudadanos, Operadores, Trabajadores, Administradores)

```javascript
{
  _id: ObjectId,
  username: String (único),
  email: String (único),
  password: String (hash bcrypt, oculto en responses),
  role: "Ciudadano" | "Operador" | "Trabajador" | "Administrador",

  // Estado de activación
  is_active: Boolean,        // Aprobado por admin (default: false)
  is_available: Boolean,     // Disponible para crews (default: true)

  // Perfil
  profile: {
    first_name: String,
    last_name: String,
    phone: String,
    age: Number,
    address: String,
    sex: "Hombre" | "Mujer" | "Otro"
  },

  profile_picture: String,   // Ruta de imagen (branch multer)

  // Soft delete
  deleted_at: Date,

  // Recuperación de contraseña
  password_reset_token: String,
  password_reset_expires: Date,

  // Timestamps automáticos
  created_at: Date,
  updated_at: Date
}
```

**Relaciones Virtuales:**

- `reports`: Reportes creados por este usuario (author)
- `assigned_reports`: Reportes asignados a este operador
- `assigned_tasks`: Tareas asignadas a este operador
- `progress_reports`: Progress reports creados por este trabajador
- `crews_led`: Cuadrillas lideradas
- `crews_member`: Cuadrillas donde es miembro

### 2. Report (Reporte)

**Propósito:** Problemas reportados por ciudadanos

```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  status: "Pendiente" | "Revisado" | "Aceptado" | "Completado" | "Rechazado",

  // Relaciones
  author: ObjectId (ref: User),           // Ciudadano que creó el reporte
  assigned_operator: ObjectId (ref: User), // Operador asignado (null inicialmente)

  // Ubicación
  location: {
    lat: Number,
    lng: Number
  },

  // Tipo de reporte
  report_type: "Bache" | "Alumbrado" | "Basura" | "Otro",
  other_type_detail: String,  // Si report_type === "Otro"

  // Control
  task_assigned: Boolean,     // Si ya se creó una tarea
  approved_at: Date,          // Cuándo se aprobó
  completed_at: Date,         // Cuándo se completó
  deleted_at: Date,           // Soft delete

  images: [String],           // Array de rutas de imágenes (branch multer)

  created_at: Date,
  updated_at: Date
}
```

**Ciclo de vida de un Reporte:**

```
Pendiente → Revisado (operador lo toma) → Aceptado (operador aprueba) →
Completado (tarea finalizada) O Rechazado (operador rechaza)
```

### 3. Task (Tarea)

**Propósito:** Tareas creadas por operadores para que los trabajadores las ejecuten

```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  status: "Pendiente" | "En Progreso" | "Finalizada" | "Rechazado",
  priority: "Baja" | "Media" | "Alta",

  // Relaciones
  report: [ObjectId] (ref: Report),         // Array de reportes asociados
  assigned_operator: ObjectId (ref: User),  // Operador que creó la tarea
  crew: ObjectId (ref: Crew),               // Cuadrilla asignada

  // Ubicación (copiada del reporte)
  location: {
    lat: Number,
    lng: Number
  },

  // Tipo de tarea
  task_type: "Reparación" | "Mantenimiento" | "Recolección" | "Supervisión",

  // Fechas
  start_date: Date,
  end_date: Date,
  completed_at: Date,
  deleted_at: Date,

  created_at: Date,
  updated_at: Date
}
```

**Características importantes:**

- ✅ Una tarea puede tener **múltiples reportes** asociados (`report: [ObjectId]`)
- ✅ Cuando la tarea se completa, **todos los reportes** se marcan como "Completado"
- ✅ La tarea se completa automáticamente cuando se crea un Progress Report con status "Finalizado"

### 4. Crew (Cuadrilla)

**Propósito:** Grupos de trabajadores liderados por un líder

```javascript
{
  _id: ObjectId,
  name: String,
  description: String,

  // Relaciones
  leader: ObjectId (ref: User, role: "Trabajador"),  // Líder de la cuadrilla
  members: [ObjectId] (ref: User, role: "Trabajador"), // Miembros

  deleted_at: Date,
  created_at: Date,
  updated_at: Date
}
```

**Reglas:**

- Un trabajador solo puede estar en UNA cuadrilla (como miembro)
- El líder NO está en members[] (está en leader)
- Solo trabajadores con `is_available: true` pueden unirse

### 5. ProgressReport (Reporte de Progreso)

**Propósito:** Actualizaciones de progreso enviadas por líderes de cuadrilla

```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  status: "Pendiente" | "En Progreso" | "Finalizado",

  // Relaciones
  worker: ObjectId (ref: User),  // Líder que crea el progress
  crew: ObjectId (ref: Crew),    // Cuadrilla ejecutando
  task: ObjectId (ref: Task),    // Tarea asociada

  // Ubicación (opcional, puede ser diferente a la tarea)
  location: {
    lat: Number,
    lng: Number
  },

  images: [String],  // Array de rutas de imágenes (branch multer)
  deleted_at: Date,
  created_at: Date,
  updated_at: Date
}
```

**⚡ Lógica Automática de Finalización:**

Cuando se crea un Progress Report con `status: "Finalizado"`, se ejecuta automáticamente:

1. **Actualiza la Task relacionada:**

   - `status: "Finalizada"`
   - `completed_at: <fecha actual>`

2. **Actualiza TODOS los Reports asociados a la tarea:**
   - `status: "Completado"`
   - `completed_at: <fecha actual>`

```javascript
// Ejemplo: Una tarea tiene 3 reportes asociados
POST /api/progress-report
{
  "status": "Finalizado",  // ← Trigger automático
  "task": "task_id",
  ...
}

// Resultado automático:
Task → status: "Finalizada", completed_at: <fecha>
Report 1 → status: "Completado", completed_at: <fecha>
Report 2 → status: "Completado", completed_at: <fecha>
Report 3 → status: "Completado", completed_at: <fecha>
```

**Flujo de Cascada:**

```
Progress Report (status: "Finalizado")
    ↓
Task (actualizada automáticamente)
    ↓
Reports[] (todos actualizados automáticamente)
```

---

## 🔐 SISTEMA DE AUTENTICACIÓN {#autenticación}

### Flujo de Registro/Login

#### 1. Registro (POST /api/auth/register)

```javascript
// Request
{
  "username": "juan123",
  "email": "juan@mail.com",
  "password": "123456",
  "role": "Operador",  // o "Ciudadano", "Trabajador"
  "profile": {
    "first_name": "Juan",
    "last_name": "Pérez",
    "phone": "1234567890",
    "sex": "Hombre"
  }
}

// Proceso interno:
1. Validar datos con express-validator
2. Hash de password con bcrypt (10 salt rounds)
3. Crear usuario en BD
4. Si role === "Ciudadano" → is_active = true (auto-activado)
5. Si role !== "Ciudadano" → is_active = false (requiere aprobación de admin)
6. Generar JWT token
7. Responder con user y token
```

#### 2. Login (POST /api/auth/login)

```javascript
// Request
{
  "username": "juan123",  // o email
  "password": "123456"
}

// Proceso interno:
1. Buscar usuario por username o email
2. Verificar que deleted_at === null
3. Verificar que is_active === true
4. Comparar password con bcrypt.compare()
5. Generar JWT token con: { _id, username, email, role }
6. Responder con user y token
```

### Middleware de Autenticación

```javascript
// authMiddleware (src/middlewares/auth.middleware.js)

// Verifica el token JWT en cada request protegida
1. Extrae token del header Authorization: "Bearer <token>"
2. Verifica firma del token con JWT_SECRET
3. Decodifica payload del token
4. Busca usuario en BD por _id
5. Agrega req.user con los datos del usuario
6. Permite continuar al siguiente middleware/controller
```

### Rutas Públicas vs Protegidas

```javascript
// routes/index.js

// PÚBLICAS (sin authMiddleware):
- /api/auth/login
- /api/auth/register
- /api/map/*           // Mapa público
- /api/statistics/*    // Estadísticas públicas

// PROTEGIDAS (con authMiddleware):
- /api/user/*
- /api/report/*
- /api/task/*
- /api/crew/*
- /api/progress-report/*
- /api/dashboard/*
```

### Roles y Permisos

| Rol                    | Permisos                                                                                                                                              |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Ciudadano**          | - Crear reportes<br>- Ver sus propios reportes<br>- Subir imágenes a reportes                                                                         |
| **Operador**           | - Ver reportes pendientes<br>- Revisar/Aceptar/Rechazar reportes<br>- Crear tareas<br>- Asignar cuadrillas a tareas<br>- Ver dashboard de operador    |
| **Trabajador** (Líder) | - Ver tareas de su cuadrilla<br>- Crear progress reports<br>- Subir imágenes de progreso<br>- Ver dashboard de trabajador                             |
| **Administrador**      | - Aprobar/Rechazar usuarios<br>- Crear/Editar cuadrillas<br>- Ver estadísticas globales<br>- Ver dashboard completo<br>- Gestionar todos los usuarios |

---

## 🌐 ENDPOINTS DE LA API {#endpoints}

### Autenticación (/api/auth)

```
POST   /api/auth/register         Registrar nuevo usuario
POST   /api/auth/login            Login (obtener token)
```

### Usuarios (/api/user)

```
GET    /api/user/:id              Obtener usuario por ID
GET    /api/user/workers          Listar todos los trabajadores
GET    /api/user/pending          Listar usuarios pendientes de aprobación
PUT    /api/user/activate/:id     Activar usuario (admin)
PUT    /api/user/reject/:id       Rechazar usuario (soft delete)
PUT    /api/user/available/:id    Toggle disponibilidad de trabajador
PUT    /api/user/profile-picture/:id  Subir/actualizar foto de perfil (multer)
```

### Reportes (/api/report)

```
POST   /api/report                Crear reporte (con imágenes)
GET    /api/reports               Listar todos los reportes
GET    /api/reports/pending       Reportes con status "Pendiente"
GET    /api/reports/author        Reportes del usuario logueado
GET    /api/report/:id            Obtener reporte por ID
GET    /api/report/operator       Reportes asignados al operador logueado
GET    /api/reports/operator/accepted  Reportes aceptados sin tarea asignada
GET    /api/report/operator/new-reports  Reportes pendientes (para operador)
PUT    /api/report/review/:id     Cambiar status a "Revisado"
PUT    /api/report/accept/:id     Cambiar status a "Aceptado"
PUT    /api/report/complete/:id   Cambiar status a "Completado"
PUT    /api/report/reject/:id     Cambiar status a "Rechazado"
PUT    /api/report/:id            Actualizar reporte (agregar imágenes)
DELETE /api/report/:id            Eliminar reporte
```

### Tareas (/api/task)

```
POST   /api/task                  Crear tarea desde reporte
GET    /api/tasks                 Listar todas las tareas
GET    /api/task/:id              Obtener tarea por ID
GET    /api/task/crew/:crewId     Tareas asignadas a una cuadrilla
PUT    /api/task/:id              Actualizar tarea
DELETE /api/task/:id              Eliminar tarea
```

### Cuadrillas (/api/crew)

```
POST   /api/crew                  Crear cuadrilla
GET    /api/crews                 Listar todas las cuadrillas
GET    /api/crew/:id              Obtener cuadrilla por ID
PUT    /api/crew/:id              Actualizar cuadrilla
DELETE /api/crew/:id              Eliminar cuadrilla
```

### Progress Reports (/api/progress-report)

```
POST   /api/progress-report       Crear progress report (con imágenes)
GET    /api/progress-report       Listar todos los progress
GET    /api/progress-report/leader  Progress del líder logueado
GET    /api/progress-report/:id   Obtener progress por ID
PUT    /api/progress-report/:id   Actualizar progress (agregar imágenes)
DELETE /api/progress-report/:id   Eliminar progress
```

### Dashboard (/api/dashboard)

```
GET    /api/dashboard/admin       Datos del dashboard de administrador
GET    /api/dashboard/operator    Datos del dashboard de operador
GET    /api/dashboard/worker      Datos del dashboard de trabajador
```

### Estadísticas (/api/statistics) - PÚBLICAS

```
GET    /api/statistics/doughnut-data        Gráfico de dona (admin)
GET    /api/statistics/doughnut-data-operator  Gráfico de dona (operador)
GET    /api/statistics/line-chart-data      Gráfico de líneas (admin)
GET    /api/statistics/line-chart-data-operator  Gráfico de líneas (operador)
GET    /api/statistics/bar-chart-data       Gráfico de barras (admin)
GET    /api/statistics/bar-chart-data-operator  Gráfico de barras (operador)
```

### Mapa (/api/map) - PÚBLICAS

```
GET    /api/map/data              Datos del mapa (todos los reportes/tareas/progress)
GET    /api/map/operator-data     Datos del mapa filtrados por operador
```

---

## ⚙️ FUNCIONALIDADES PRINCIPALES {#funcionalidades}

### 1. Gestión de Usuarios

**Flujo de aprobación de usuarios:**

```
1. Usuario se registra como Operador/Trabajador → is_active = false
2. Admin ve usuarios pendientes: GET /api/user/pending
3. Admin aprueba: PUT /api/user/activate/:id → is_active = true
4. Usuario ya puede hacer login
```

**Estados de usuario:**

- `is_active: false` → No puede hacer login
- `is_active: true` → Puede hacer login
- `deleted_at: !== null` → Usuario rechazado/eliminado (soft delete)
- `is_available: false` → Trabajador no disponible para crews

### 2. Ciclo de Vida de un Reporte

```
1. CIUDADANO crea reporte
   POST /api/report
   status: "Pendiente"
   assigned_operator: null
   ↓
2. OPERADOR revisa reporte
   PUT /api/report/review/:id
   status: "Revisado"
   assigned_operator: <operador_id>
   ↓
3. OPERADOR acepta O rechaza

   ACEPTAR:
   PUT /api/report/accept/:id
   status: "Aceptado"
   approved_at: <fecha>

   RECHAZAR:
   PUT /api/report/reject/:id
   status: "Rechazado"
   FIN ❌
   ↓
4. OPERADOR crea tarea desde reporte
   POST /api/task
   report.task_assigned = true
   ↓
5. TRABAJADOR (líder) ejecuta y crea progress reports
   POST /api/progress-report
   ↓
6. OPERADOR completa reporte cuando tarea termina
   PUT /api/report/complete/:id
   status: "Completado"
   completed_at: <fecha>
   FIN ✅
```

### 3. Sistema de Tareas

**Creación de tarea:**

```javascript
// Controller: task.controller.js → createTask()

1. Buscar reporte por ID
2. Validar que status === "Aceptado"
3. Validar que task_assigned === false
4. Crear tarea con:
   - Datos del body (title, description, priority, dates)
   - report: <report_id>
   - assigned_operator: req.user._id
   - crew: <crew_id>
   - location: { lat, lng } (copiada del reporte)
5. Actualizar reporte: task_assigned = true
6. Responder con tarea creada
```

**Estados de tarea:**

- `Pendiente` → Recién creada
- `En Progreso` → Cuadrilla trabajando
- `Completado` → Tarea finalizada
- `Rechazado` → Tarea cancelada

### 4. Dashboard por Roles

#### Dashboard Admin (GET /api/dashboard/admin)

```javascript
{
  totalReports: 150,
  totalTasks: 80,
  totalUsers: 45,
  totalCrews: 8,
  reportsByStatus: {
    Pendiente: 20,
    Revisado: 10,
    Aceptado: 30,
    Completado: 80,
    Rechazado: 10
  },
  tasksByStatus: {
    Pendiente: 15,
    "En Progreso": 25,
    Completado: 35,
    Rechazado: 5
  }
}
```

#### Dashboard Operator (GET /api/dashboard/operator)

```javascript
{
  myReports: 30,          // Reportes asignados a este operador
  myTasks: 15,            // Tareas creadas por este operador
  pendingReports: 5,      // Reportes pendientes de revisar
  acceptedReports: 10,    // Reportes aceptados sin tarea
  reportsByStatus: { ... },
  tasksByStatus: { ... }
}
```

#### Dashboard Worker (GET /api/dashboard/worker)

```javascript
{
  myTasks: 8,             // Tareas de la cuadrilla del trabajador
  myProgressReports: 12,  // Progress reports creados por este líder
  crew: {                 // Cuadrilla del trabajador
    name: "Cuadrilla A",
    leader: { ... },
    members: [ ... ]
  },
  tasksByStatus: { ... }
}
```

### 5. Estadísticas y Gráficos

Las estadísticas se generan con **agregaciones de MongoDB** para crear datos para gráficos.

#### Gráfico de Dona (Doughnut)

```javascript
// Distribución de reportes por tipo
{
  labels: ["Bache", "Alumbrado", "Basura", "Otro"],
  datasets: [{
    data: [45, 30, 15, 10],
    backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0"]
  }]
}
```

#### Gráfico de Líneas (Line Chart)

```javascript
// Reportes creados por mes
{
  labels: ["Enero", "Febrero", "Marzo", ...],
  datasets: [{
    label: "Reportes Aceptados",
    data: [10, 15, 20, 25, 30, ...]
  }]
}
```

#### Gráfico de Barras (Bar Chart)

```javascript
// Reportes por estado
{
  labels: ["Pendiente", "Revisado", "Aceptado", "Completado", "Rechazado"],
  datasets: [{
    label: "Cantidad",
    data: [20, 10, 30, 80, 10]
  }]
}
```

**IMPORTANTE:** Las estadísticas de **Operador** solo muestran datos de reportes/tareas asignados a ese operador.

### 6. Mapa Interactivo

#### Mapa Público (GET /api/map/data)

```javascript
{
  reports: [
    { _id, title, location: {lat, lng}, status, report_type, ... }
  ],
  tasks: [
    { _id, title, location: {lat, lng}, status, priority, crew, ... }
  ],
  progressReports: [
    { _id, title, location: {lat, lng}, status, task, ... }
  ]
}
```

#### Mapa Operador (GET /api/map/operator-data)

```javascript
// Solo reportes/tareas asignados a este operador
// y progress reports de esas tareas
{
  reports: [ ... ],  // assigned_operator === req.user._id
  tasks: [ ... ],    // assigned_operator === req.user._id
  progressReports: [ ... ]  // de las tareas del operador
}
```

---

## 🎁 FEATURES ESPECIALES {#features}

### 1. Subida de Imágenes (Multer) - Branch `jose-dev-multer`

**Configuración:** `src/config/multer.js`

**Endpoints:**

- `PUT /api/user/profile-picture/:id` - 1 imagen (profile_picture)
- `POST/PUT /api/report` - Hasta 5 imágenes (images[])
- `POST/PUT /api/progress-report` - Hasta 5 imágenes (images[])

**Validaciones:**

- Formatos: jpg, jpeg, png, gif, webp
- Tamaño máximo: 5MB por archivo
- Storage: `uploads/profiles/`, `uploads/reports/`, `uploads/progress/`

**Acceso a imágenes:**

```
http://localhost:3000/uploads/profiles/profile-123456789.jpg
http://localhost:3000/uploads/reports/report-987654321.jpg
http://localhost:3000/uploads/progress/progress-555555555.jpg
```

### 2. Soft Delete

En vez de eliminar documentos de la BD, se marca `deleted_at: <fecha>`

**Ventajas:**

- Recuperación de datos
- Auditoría
- Historial completo

**Implementación:**

```javascript
// En todos los modelos
deleted_at: { type: Date, default: null }

// En las queries
User.find({ deleted_at: null })  // Solo usuarios activos

// Al "eliminar"
User.findByIdAndUpdate(id, { deleted_at: new Date() })
```

### 3. Cron Job - Auto-Rechazo de Reportes

**Archivo:** `src/jobs/auto_reject_reports.js`

**Propósito:** Rechazar automáticamente reportes que lleven más de X días en estado "Pendiente"

**Configuración:**

```javascript
// Se ejecuta todos los días a la medianoche (00:00)
cron.schedule("0 0 * * *", async () => {
  const diasMaximos = 30; // Ajustable
  const fechaLimite = new Date();
  fechaLimite.setDate(fechaLimite.getDate() - diasMaximos);

  // Buscar reportes pendientes antiguos
  const reportesAntiguos = await ReportModel.find({
    status: "Pendiente",
    created_at: { $lt: fechaLimite },
  });

  // Rechazarlos automáticamente
  for (let reporte of reportesAntiguos) {
    reporte.status = "Rechazado";
    await reporte.save();
  }
});
```

### 4. Validaciones con Express-Validator

**Ubicación:** `src/middlewares/validations/`

**Ejemplo:** Validación de registro

```javascript
// auth.middlewares.js

export const validateRegister = [
  body("username")
    .notEmpty()
    .withMessage("Username es requerido")
    .isLength({ min: 3 })
    .withMessage("Username mínimo 3 caracteres"),

  body("email").isEmail().withMessage("Email inválido"),

  body("password")
    .isLength({ min: 6 })
    .withMessage("Password mínimo 6 caracteres"),

  body("role")
    .isIn(["Ciudadano", "Operador", "Trabajador", "Administrador"])
    .withMessage("Rol inválido"),

  // Validar resultado
  validator,
];
```

**Uso en rutas:**

```javascript
router.post("/auth/register", validateRegister, register);
```

### 5. Helpers Reutilizables

#### bcrypt.helper.js

```javascript
// Hash de contraseña
export const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

// Comparar contraseña
export const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};
```

#### jwt.helper.js

```javascript
// Generar token
export const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// Verificar token
export const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};
```

### 6. Relaciones Virtuales en Mongoose

**Ejemplo en User Model:**

```javascript
UserSchema.virtual("reports", {
  ref: "Report",
  localField: "_id",
  foreignField: "author",
});

// Uso en controllers
const user = await UserModel.findById(id).populate("reports");
// Ahora user.reports contiene todos los reportes del usuario
```

### 7. Lógica de Auto-Completado (Progress Report → Task → Reports)

**Archivo:** `src/controllers/progress_report.controller.js`

**Propósito:** Cuando un líder marca un Progress Report como "Finalizado", automáticamente:

1. La Task se marca como "Finalizada"
2. Todos los Reports asociados a esa tarea se marcan como "Completado"

**Implementación:**

```javascript
// En createProgressReport()
if (newProgressReport.status === "Finalizado") {
  // 1. Actualizar tarea
  const task = await TaskModel.findByIdAndUpdate(
    newProgressReport.task,
    {
      status: "Finalizada",
      completed_at: new Date(),
    },
    { new: true }
  );

  // 2. Actualizar TODOS los reportes asociados
  if (task && task.report && task.report.length > 0) {
    await ReportModel.updateMany(
      { _id: { $in: task.report } },
      {
        status: "Completado",
        completed_at: new Date(),
      }
    );
  }
}
```

**Ejemplo práctico:**

```
Tarea: "Reparar 5 baches en Av. Principal"
  ├─ Reporte 1: "Bache frente al banco"
  ├─ Reporte 2: "Bache en esquina"
  ├─ Reporte 3: "Bache cerca de escuela"
  ├─ Reporte 4: "Bache en cruce"
  └─ Reporte 5: "Bache junto a parada"

Líder crea Progress Report con status: "Finalizado"
→ Tarea → "Finalizada" + completed_at
→ Los 5 reportes → "Completado" + completed_at
```

**Ventajas:**

- ✅ **Automático:** No requiere llamadas adicionales del frontend
- ✅ **Consistente:** Todos los reportes se completan simultáneamente
- ✅ **Eficiente:** Una sola operación con `updateMany()`
- ✅ **Auditado:** Se registra `completed_at` en Task y Reports

---

## 🔄 FLUJO DE TRABAJO COMPLETO {#flujo}

### Caso de Uso: "Desde que un ciudadano reporta un bache hasta que se repara"

```
┌─────────────────────────────────────────────────────────┐
│ 1. CIUDADANO REPORTA BACHE                              │
└─────────────────────────────────────────────────────────┘
  POST /api/report
  {
    title: "Bache en Av. Principal",
    description: "Bache grande que daña vehículos",
    report_type: "Bache",
    location: { lat: -34.6037, lng: -58.3816 },
    images: [file1, file2]  // Opcional (branch multer)
  }
  → Se crea Report con status: "Pendiente"

┌─────────────────────────────────────────────────────────┐
│ 2. OPERADOR VE REPORTES PENDIENTES                      │
└─────────────────────────────────────────────────────────┘
  GET /api/report/operator/new-reports
  → Aparece el reporte del bache

┌─────────────────────────────────────────────────────────┐
│ 3. OPERADOR REVISA EL REPORTE                           │
└─────────────────────────────────────────────────────────┘
  PUT /api/report/review/:id
  → status: "Revisado"
  → assigned_operator: <operador_id>

┌─────────────────────────────────────────────────────────┐
│ 4. OPERADOR ACEPTA EL REPORTE                           │
└─────────────────────────────────────────────────────────┘
  PUT /api/report/accept/:id
  → status: "Aceptado"
  → approved_at: <fecha>

┌─────────────────────────────────────────────────────────┐
│ 5. OPERADOR CREA TAREA PARA REPARAR EL BACHE            │
└─────────────────────────────────────────────────────────┘
  POST /api/task
  {
    title: "Reparar bache en Av. Principal",
    description: "Asfaltar bache de 2x1 metros",
    priority: "Alta",
    report: <report_id>,
    crew: <crew_id>,  // Cuadrilla "Mantenimiento A"
    start_date: "2025-11-10",
    end_date: "2025-11-12"
  }
  → Se crea Task con status: "Pendiente"
  → report.task_assigned = true

┌─────────────────────────────────────────────────────────┐
│ 6. LÍDER DE CUADRILLA VE LA TAREA                       │
└─────────────────────────────────────────────────────────┘
  GET /api/task/crew/:crewId
  → Aparece la tarea de reparar el bache

┌─────────────────────────────────────────────────────────┐
│ 7. LÍDER INICIA TRABAJO Y REPORTA PROGRESO              │
└─────────────────────────────────────────────────────────┘
  POST /api/progress-report
  {
    title: "Inicio de reparación - Día 1",
    description: "Removimos el asfalto dañado",
    status: "En Progreso",
    task: <task_id>,
    worker: <lider_id>,
    crew: <crew_id>,
    location: { lat: -34.6037, lng: -58.3816 },
    images: [foto_antes, foto_durante]  // Opcional (branch multer)
  }
  → Se crea ProgressReport

┌─────────────────────────────────────────────────────────┐
│ 8. LÍDER CONTINÚA REPORTANDO PROGRESO                   │
└─────────────────────────────────────────────────────────┘
  POST /api/progress-report
  {
    title: "Avance - Día 2",
    description: "Aplicamos asfalto nuevo",
    status: "En Progreso",
    ...
  }

┌─────────────────────────────────────────────────────────┐
│ 9. LÍDER FINALIZA TRABAJO (AUTO-COMPLETADO)            │
└─────────────────────────────────────────────────────────┘
  POST /api/progress-report
  {
    title: "Trabajo completado - Día 3",
    description: "Bache reparado y señalizado",
    status: "Finalizado",  // ← TRIGGER AUTOMÁTICO
    images: [foto_final]
    ...
  }

  → ProgressReport creado con status: "Finalizado"

  ⚡ AUTOMÁTICAMENTE SE EJECUTA:

  1. Task actualizada:
     - status: "Finalizada"
     - completed_at: <fecha actual>

  2. Report actualizado:
     - status: "Completado"
     - completed_at: <fecha actual>

  FIN ✅ El bache está reparado (sin intervención manual del operador)
```

---

## 💡 MEJORAS SUGERIDAS {#mejoras}

### 🔒 Seguridad

1. **Encriptación de variables de entorno**

   - Usar dotenv-vault o similar
   - No commitear .env al repo

2. **Rate Limiting**

   ```javascript
   npm install express-rate-limit

   // app.js
   import rateLimit from 'express-rate-limit';

   const limiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutos
     max: 100 // máximo 100 requests por IP
   });

   app.use('/api/', limiter);
   ```

3. **Helmet.js** (headers de seguridad)

   ```javascript
   npm install helmet

   import helmet from 'helmet';
   app.use(helmet());
   ```

4. **Validación de imágenes más estricta**

   - Verificar magic numbers (header del archivo)
   - Escaneo antivirus con ClamAV
   - Compresión automática de imágenes

5. **HTTPS en producción**
   - Usar certificados SSL/TLS
   - Forzar HTTPS con redirect

### ⚡ Optimización

1. **Índices en MongoDB**

   ```javascript
   // user.model.js
   UserSchema.index({ email: 1 });
   UserSchema.index({ username: 1 });
   UserSchema.index({ role: 1, is_active: 1 });

   // report.model.js
   ReportSchema.index({ status: 1, created_at: -1 });
   ReportSchema.index({ assigned_operator: 1 });
   ReportSchema.index({ location: "2dsphere" }); // Búsqueda geoespacial
   ```

2. **Paginación en listados**

   ```javascript
   // Ejemplo
   GET /api/reports?page=1&limit=20

   const page = parseInt(req.query.page) || 1;
   const limit = parseInt(req.query.limit) || 20;
   const skip = (page - 1) * limit;

   const reports = await ReportModel.find()
     .skip(skip)
     .limit(limit)
     .sort({ created_at: -1 });

   const total = await ReportModel.countDocuments();

   res.json({
     reports,
     pagination: {
       page,
       limit,
       total,
       pages: Math.ceil(total / limit)
     }
   });
   ```

3. **Caché con Redis**

   ```javascript
   npm install redis

   // Para estadísticas que no cambian constantemente
   // Cachear por 5 minutos
   ```

4. **Compresión de responses**

   ```javascript
   npm install compression

   import compression from 'compression';
   app.use(compression());
   ```

5. **Lazy loading en relaciones**

   ```javascript
   // Solo popular cuando sea necesario
   const report = await ReportModel.findById(id); // Sin populate

   // vs

   const report = await ReportModel.findById(id)
     .populate("author")
     .populate("assigned_operator"); // Más pesado
   ```

### 🚀 Nuevas Features

1. **Notificaciones en tiempo real**

   - Socket.io para WebSockets
   - Notificar a operadores cuando hay nuevo reporte
   - Notificar a ciudadanos cuando su reporte cambia de estado

2. **Sistema de comentarios**

   - Modelo Comment con referencia a Report
   - Permitir conversación entre ciudadano y operador

3. **Historial de cambios (Auditoría)**

   - Modelo AuditLog
   - Registrar quién hizo qué y cuándo
   - Útil para debugging y responsabilidad

4. **Búsqueda geoespacial**

   ```javascript
   // Buscar reportes cercanos a una ubicación
   GET /api/reports/nearby?lat=-34.6037&lng=-58.3816&radius=5000

   // Usar índice 2dsphere
   const reports = await ReportModel.find({
     location: {
       $near: {
         $geometry: {
           type: "Point",
           coordinates: [lng, lat]
         },
         $maxDistance: radius
       }
     }
   });
   ```

5. **Exportar reportes a PDF/Excel**

   - Librería: pdfkit, exceljs
   - Endpoint: GET /api/reports/export?format=pdf

6. **Dashboard en tiempo real**

   - Actualizar estadísticas automáticamente cada X segundos
   - WebSockets para enviar actualizaciones

7. **Sistema de priorización automática**

   - IA/ML para detectar reportes urgentes
   - Asignar prioridad según tipo, ubicación, historial

8. **App móvil nativa**

   - React Native
   - Notificaciones push
   - Geolocalización automática

9. **Panel de métricas avanzadas**

   - Tiempo promedio de resolución
   - Operadores más eficientes
   - Zonas con más reportes
   - Análisis predictivo

10. **Integración con servicios externos**
    - Google Maps API para geocoding
    - Servicio de SMS para notificaciones
    - Email service (Sendgrid, Mailgun)

### 📊 Testing

1. **Tests unitarios (Jest)**

   ```javascript
   npm install --save-dev jest supertest

   // test/auth.test.js
   describe("Auth", () => {
     test("Register user", async () => {
       const res = await request(app)
         .post("/api/auth/register")
         .send({ ... });
       expect(res.status).toBe(201);
     });
   });
   ```

2. **Tests de integración**

   - Probar flujos completos
   - Base de datos de testing separada

3. **Tests de carga (Artillery, k6)**
   - Verificar rendimiento con muchos usuarios simultáneos

### 📝 Documentación

1. **Swagger/OpenAPI**

   ```javascript
   npm install swagger-ui-express swagger-jsdoc

   // Generar documentación automática de la API
   // Accesible en http://localhost:3000/api-docs
   ```

2. **Postman Collection**

   - Exportar todas las requests
   - Compartir con el equipo

3. **README mejorado**
   - Instrucciones de instalación
   - Variables de entorno necesarias
   - Comandos útiles

### 🎨 UX/UI Backend

1. **Mensajes de error más descriptivos**

   ```javascript
   // Malo
   res.status(400).json({ ok: false, msg: "Error" });

   // Bueno
   res.status(400).json({
     ok: false,
     msg: "No se pudo crear el reporte",
     errors: {
       title: "El título es requerido",
       location: "La ubicación debe tener lat y lng",
     },
   });
   ```

2. **Códigos de estado HTTP correctos**

   - 200: OK
   - 201: Created
   - 400: Bad Request
   - 401: Unauthorized
   - 403: Forbidden
   - 404: Not Found
   - 500: Internal Server Error

3. **Respuestas consistentes**
   ```javascript
   // Siempre mismo formato
   {
     ok: true/false,
     data: { ... },  // o user, report, etc.
     msg: "Mensaje descriptivo",
     errors: { ... }  // Si hay errores
   }
   ```

---

## ❓ PREGUNTAS FRECUENTES {#faq}

### ¿Cómo inicio el proyecto?

```bash
# 1. Clonar repositorio
git clone https://github.com/JoseFR2001/munifor-back.git

# 2. Instalar dependencias
cd munifor-back
npm install

# 3. Configurar variables de entorno
# Crear archivo .env con:
PORT=3000
MONGO_URI=mongodb://localhost:27017/munifor
JWT_SECRET=tu_secreto_super_secreto_aqui

# 4. Iniciar MongoDB (en otra terminal)
mongod

# 5. (Opcional) Poblar BD con datos de prueba
node scripts/seed.js

# 6. Iniciar servidor
npm run dev

# Servidor corriendo en http://localhost:3000
```

### ¿Cómo pruebo los endpoints?

1. **Thunder Client** (extensión de VS Code)
2. **Postman**
3. **curl** desde terminal
4. **Frontend** (React)

**Ejemplo con curl:**

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"123456"}'

# Obtener reportes (con token)
curl http://localhost:3000/api/reports \
  -H "Authorization: Bearer <tu_token_aqui>"
```

### ¿Qué pasa si olvido mi contraseña?

Por ahora NO hay sistema de recuperación implementado. Se puede agregar:

1. Endpoint `/api/auth/forgot-password` que envía email con token
2. Endpoint `/api/auth/reset-password/:token` para cambiar contraseña
3. Campo `password_reset_token` y `password_reset_expires` ya existen en el modelo

### ¿Cómo funciona el soft delete?

Nunca se elimina físicamente un documento. Se marca `deleted_at: <fecha>`

```javascript
// Eliminar usuario
User.findByIdAndUpdate(id, { deleted_at: new Date() });

// Recuperar usuario
User.findByIdAndUpdate(id, { deleted_at: null });

// Listar solo activos
User.find({ deleted_at: null });
```

### ¿Por qué los Ciudadanos se activan automáticamente?

Decisión de negocio: Los ciudadanos pueden reportar inmediatamente.
Los Operadores/Trabajadores/Admins necesitan aprobación para evitar registros falsos.

### ¿Cómo se asignan las tareas a las cuadrillas?

1. Operador crea tarea: `POST /api/task` con `crew: <crew_id>`
2. Líder de esa cuadrilla ve la tarea: `GET /api/task/crew/:crewId`
3. Solo el líder puede crear progress reports para esa tarea

### ¿Puedo tener un trabajador en varias cuadrillas?

NO. Regla de negocio: Un trabajador solo puede estar en UNA cuadrilla a la vez (como member).
El líder NO está en `members[]`, está en `leader`.

### ¿Qué es el cron job y cuándo se ejecuta?

Es una tarea automática que se ejecuta todos los días a medianoche (00:00).
Rechaza reportes que llevan más de 30 días en estado "Pendiente".

**Archivo:** `src/jobs/auto_reject_reports.js`

### ¿Cómo cambio el puerto del servidor?

Editar archivo `.env`:

```
PORT=5000
```

O desde terminal:

```bash
PORT=5000 npm run dev
```

### ¿Dónde está la base de datos?

MongoDB local por defecto. Ver `MONGO_URI` en `.env`

Para producción: MongoDB Atlas (cloud)

### ¿Cómo agrego un nuevo rol?

1. Editar `user.model.js`:

```javascript
role: {
  type: String,
  enum: ["Ciudadano", "Operador", "Trabajador", "Administrador", "NuevoRol"],
  default: "Ciudadano"
}
```

2. Actualizar lógica en `auth.controller.js` para `is_active`
3. Crear dashboard específico si es necesario

### ¿Qué pasa si subo una imagen muy grande?

Multer rechaza con error `File too large`. Límite: 5MB por archivo.

### ¿Cómo sé qué usuario está logueado?

Después del `authMiddleware`, accede a `req.user`:

```javascript
const userId = req.user._id;
const userRole = req.user.role;
const userName = req.user.username;
```

---

## 🎓 TIPS PARA LA EXPOSICIÓN

### 1. Estructura de la Presentación

```
1. Introducción (2 min)
   - Problema que resuelve MuniFor
   - Objetivos del sistema

2. Arquitectura (3 min)
   - Diagrama de arquitectura
   - Tecnologías utilizadas
   - Estructura de carpetas

3. Modelos de Datos (5 min)
   - Explicar cada modelo
   - Mostrar relaciones
   - Diagrama ER

4. Demo en Vivo (10 min)
   - Registro de usuario
   - Crear reporte (con imágenes)
   - Operador revisa y acepta
   - Crea tarea
   - Líder reporta progreso
   - Mostrar dashboard y estadísticas
   - Mostrar mapa

5. Features Destacadas (5 min)
   - Autenticación JWT
   - Subida de imágenes
   - Soft delete
   - Cron job
   - Dashboards personalizados

6. Mejoras Futuras (2 min)
   - Lista de mejoras sugeridas

7. Q&A (3 min)
```

### 2. Preguntas Típicas de Profesores

**P: ¿Por qué MongoDB y no SQL?**
R: MongoDB es NoSQL, ideal para datos semi-estructurados. Los reportes pueden tener diferentes campos opcionales (images[], other_type_detail). Flexibilidad y escalabilidad.

**P: ¿Cómo aseguran la autenticación?**
R: JWT (JSON Web Tokens) firmados con secreto. Hash de contraseñas con bcrypt (10 salt rounds). Middleware que verifica token en cada request protegida.

**P: ¿Qué pasa si dos operadores toman el mismo reporte?**
R: El primero que ejecute PUT /api/report/review/:id lo asigna a sí mismo. El segundo verá que ya está asignado (status !== "Pendiente").

**P: ¿Cómo manejan errores?**
R: Try-catch en todos los controllers, respuestas consistentes con { ok, msg, errors }, códigos HTTP correctos, validaciones con express-validator.

**P: ¿Es escalable?**
R: Sí. MongoDB permite escalamiento horizontal (sharding), Express es ligero, stateless (JWT permite múltiples instancias del servidor).

**P: ¿Probaron el sistema?**
R: Sí, tests manuales con Thunder Client/Postman. (Si hay tiempo: agregar tests automatizados con Jest)

### 3. Demostración Efectiva

**Preparación:**

1. Tener datos de prueba en la BD (seed.js)
2. Postman/Thunder Client con todas las requests guardadas
3. Servidor corriendo antes de empezar
4. Frontend funcionando (si aplica)

**Flujo de demo:**

```
1. Mostrar código (VS Code)
   - Estructura de carpetas
   - Un modelo (report.model.js)
   - Un controller (report.controller.js)

2. Mostrar Postman/Thunder Client
   - POST /auth/register (crear ciudadano)
   - POST /auth/login (obtener token)
   - POST /report (crear reporte con imagen)
   - GET /reports (mostrar que aparece)

3. Cambiar a operador
   - Login como operador
   - GET /report/operator/new-reports
   - PUT /report/review/:id
   - PUT /report/accept/:id
   - POST /task (crear tarea)

4. Mostrar estadísticas
   - GET /api/statistics/doughnut-data
   - GET /api/dashboard/admin

5. Mostrar mapa
   - GET /api/map/data

6. Mostrar MongoDB Compass
   - Colecciones
   - Documentos
   - Relaciones
```

### 4. Glosario de Términos Técnicos

- **API REST:** Interfaz de programación de aplicaciones basada en HTTP
- **JWT:** JSON Web Token, para autenticación sin estado
- **Bcrypt:** Algoritmo de hash para contraseñas
- **Middleware:** Función que se ejecuta entre la request y el controller
- **Mongoose:** ODM (Object Document Mapper) para MongoDB
- **Soft Delete:** Marcar como eliminado sin borrar físicamente
- **CORS:** Cross-Origin Resource Sharing, política de seguridad
- **Cron Job:** Tarea programada que se ejecuta automáticamente
- **Multer:** Middleware para subida de archivos
- **Express-validator:** Middleware para validación de datos
- **Populate:** Cargar documentos relacionados en Mongoose
- **Aggregation:** Operaciones complejas en MongoDB (groupBy, sum, etc.)
- **Schema:** Estructura de un documento en MongoDB
- **Virtual:** Campo calculado que no se guarda en BD

---

## ✅ CHECKLIST FINAL

Antes de la exposición:

- [ ] Leer toda esta guía
- [ ] Probar todos los endpoints
- [ ] Entender flujo completo de un reporte
- [ ] Explicar cada modelo sin leer
- [ ] Saber qué hace cada carpeta
- [ ] Tener datos de prueba en BD
- [ ] Servidor corriendo sin errores
- [ ] Preparar demo en vivo
- [ ] Practicar presentación (timing)
- [ ] Revisar código (comentarios, limpieza)
- [ ] Backup de la BD
- [ ] .env configurado correctamente
- [ ] README.md actualizado

---

## 📞 CONTACTO Y RECURSOS

**Repositorio:** https://github.com/JoseFR2001/munifor-back

**Documentación adicional:**

- Express.js: https://expressjs.com/
- Mongoose: https://mongoosejs.com/
- JWT: https://jwt.io/
- Multer: https://github.com/expressjs/multer
- Node-cron: https://github.com/node-cron/node-cron

---

**¡Éxito en la exposición! 🎉🚀**

_Documento generado el 9 de noviembre de 2025_
