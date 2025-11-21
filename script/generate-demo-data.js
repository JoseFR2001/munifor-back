//* ============================================
//* SCRIPT DE GENERACIÓN DE DATOS DE DEMOSTRACIÓN
//* ============================================
//* Para presentación al profesor
//* Genera: Reportes, Tareas, Avances y Cuadrillas con coordenadas reales de Formosa Capital

//! ⚙️ CONFIGURACIÓN - CAMBIAR ESTA CONSTANTE PARA CONTROLAR LA CANTIDAD DE DATOS
const DATA_COUNT = 100; // Cambiar este número para generar más o menos datos

//! ⏰ RANGO DE FECHAS - Distribución de datos a lo largo del tiempo
const DATE_RANGE_DAYS = 365; // Genera datos distribuidos en los últimos 365 días (1 año)

//! 📍 LÍMITES GEOGRÁFICOS - FORMOSA CAPITAL, ARGENTINA
const FORMOSA_BOUNDS = {
  // Centro aproximado de Formosa: -26.1857° S, -58.1756° W
  LAT_MIN: -26.25, // Sur
  LAT_MAX: -26.12, // Norte
  LNG_MIN: -58.25, // Oeste
  LNG_MAX: -58.1, // Este
};

//! IMPORTS
import mongoose from "mongoose";
import dotenv from "dotenv";
import ReportModel from "../src/models/report.model.js";
import TaskModel from "../src/models/task.model.js";
import ProgressReportModel from "../src/models/progress_report.model.js";
import CrewModel from "../src/models/crew.model.js";
import UserModel from "../src/models/user.model.js";

// Cargar variables de entorno
dotenv.config();

//* ============================================
//* FUNCIONES AUXILIARES
//* ============================================

/**
 * Genera coordenadas aleatorias dentro de los límites de Formosa Capital
 * @returns {Object} { lat: Number, lng: Number }
 */
const getRandomCoordinates = () => {
  const lat =
    FORMOSA_BOUNDS.LAT_MIN +
    Math.random() * (FORMOSA_BOUNDS.LAT_MAX - FORMOSA_BOUNDS.LAT_MIN);
  const lng =
    FORMOSA_BOUNDS.LNG_MIN +
    Math.random() * (FORMOSA_BOUNDS.LNG_MAX - FORMOSA_BOUNDS.LNG_MIN);
  return { lat, lng };
};

/**
 * Genera una fecha aleatoria en los últimos N días
 * @param {Number} daysAgo - Días hacia atrás desde hoy
 * @returns {Date}
 */
const getRandomDate = (daysAgo) => {
  const now = new Date();
  const past = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
  const randomTime =
    past.getTime() + Math.random() * (now.getTime() - past.getTime());
  return new Date(randomTime);
};

/**
 * Selecciona un elemento aleatorio de un array
 * @param {Array} array
 * @returns {*}
 */
const randomChoice = (array) => array[Math.floor(Math.random() * array.length)];

//* ============================================
//* DATOS DE EJEMPLO REALISTAS
//* ============================================

const REPORT_TYPES = ["Bache", "Alumbrado", "Basura", "Otro"];

const REPORT_TITLES = {
  Bache: [
    "Bache profundo en la calzada",
    "Hundimiento en asfalto",
    "Pozo peligroso para vehículos",
    "Grietas en la calle",
    "Deterioro del pavimento",
  ],
  Alumbrado: [
    "Farola sin funcionamiento",
    "Luminaria rota",
    "Falta iluminación pública",
    "Poste de luz caído",
    "Cables de alumbrado expuestos",
  ],
  Basura: [
    "Acumulación de residuos",
    "Basura en la vía pública",
    "Contenedor desbordado",
    "Vertedero clandestino",
    "Escombros abandonados",
  ],
  Otro: [
    "Árbol caído bloqueando la vía",
    "Señalización vial faltante",
    "Alcantarilla obstruida",
    "Daño en vereda",
    "Graffiti en espacio público",
  ],
};

const REPORT_DESCRIPTIONS = {
  Bache: [
    "Se ha formado un bache considerable que representa un peligro para el tránsito vehicular",
    "Hundimiento en la calzada que puede causar daños a los vehículos",
    "Gran deterioro del asfalto con múltiples pozos",
    "Bache de gran tamaño que abarca casi todo el ancho de la calle",
  ],
  Alumbrado: [
    "La luminaria no funciona desde hace varios días, dejando la zona muy oscura",
    "El poste de luz está dañado y representa un peligro",
    "Cables sueltos que podrían ocasionar un accidente",
    "Falta de iluminación que afecta la seguridad del barrio",
  ],
  Basura: [
    "Gran acumulación de residuos que genera malos olores y atrae plagas",
    "El contenedor está desbordado y la basura se esparce por la calle",
    "Escombros y residuos de construcción abandonados en la vía pública",
    "Basura sin recolectar desde hace días",
  ],
  Otro: [
    "Situación que requiere atención municipal urgente",
    "Problema que afecta a los vecinos del sector",
    "Deterioro que compromete el espacio público",
    "Requiere intervención de las autoridades correspondientes",
  ],
};

const TASK_TYPES = [
  "Reparación",
  "Mantenimiento",
  "Recolección",
  "Supervisión",
];
const PRIORITIES = ["Baja", "Media", "Alta"];
const TASK_STATUS = ["Pendiente", "En Progreso", "Finalizada"];
const PROGRESS_STATUS = ["Pendiente", "En Progreso", "Finalizado"];

const PROGRESS_TITLES = [
  "Inicio de trabajos",
  "Avance del 25%",
  "Avance del 50%",
  "Avance del 75%",
  "Trabajo completado",
  "Reparación en proceso",
  "Materiales aplicados",
  "Finalización de tareas",
];

const PROGRESS_DESCRIPTIONS = [
  "Se han iniciado los trabajos según lo planificado",
  "El equipo está trabajando en la zona asignada",
  "Se aplicaron los materiales necesarios para la reparación",
  "Los trabajos avanzan según el cronograma establecido",
  "Se completó exitosamente la tarea asignada",
  "Se realizó inspección y se procedió con los trabajos",
  "Área restaurada y en condiciones óptimas",
  "Trabajo finalizado satisfactoriamente",
];

//* ============================================
//* FUNCIÓN PRINCIPAL DE GENERACIÓN
//* ============================================

const generateDemoData = async () => {
  try {
    console.log("🚀 Iniciando generación de datos de demostración...\n");

    //? Conectar a la base de datos
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Conectado a MongoDB\n");

    //? Obtener usuarios existentes para asignarlos
    const citizens = await UserModel.find({
      role: "Ciudadano",
      deleted_at: null,
    });
    const operators = await UserModel.find({
      role: "Operador",
      deleted_at: null,
    });
    const workers = await UserModel.find({
      role: "Trabajador",
      deleted_at: null,
    });

    console.log(`👥 Usuarios encontrados:`);
    console.log(`   - Ciudadanos: ${citizens.length}`);
    console.log(`   - Operadores: ${operators.length}`);
    console.log(`   - Trabajadores: ${workers.length}\n`);

    if (
      citizens.length === 0 ||
      operators.length === 0 ||
      workers.length === 0
    ) {
      console.log(
        "❌ ERROR: Necesitas tener usuarios de todos los roles en la BD"
      );
      console.log("   Crea al menos: 1 Ciudadano, 1 Operador, 1 Trabajador");
      process.exit(1);
    }

    //? ============================================
    //? 1. CREAR CUADRILLAS (si no existen suficientes)
    //? ============================================
    console.log("👷 Creando cuadrillas...");
    const existingCrews = await CrewModel.find({ deleted_at: null });
    let crews = existingCrews;

    const neededCrews = Math.ceil(DATA_COUNT / 10); // 1 crew cada 10 tareas
    if (existingCrews.length < neededCrews) {
      const crewsToCreate = neededCrews - existingCrews.length;
      const newCrews = [];

      for (let i = 0; i < crewsToCreate; i++) {
        const leader = randomChoice(workers);
        const memberCount = Math.floor(Math.random() * 3) + 2; // 2-4 miembros
        const members = [];

        for (let j = 0; j < memberCount; j++) {
          const member = randomChoice(workers);
          if (
            !members.includes(member._id) &&
            member._id.toString() !== leader._id.toString()
          ) {
            members.push(member._id);
          }
        }

        newCrews.push({
          name: `Cuadrilla ${existingCrews.length + i + 1}`,
          leader: leader._id,
          members: members,
        });
      }

      const createdCrews = await CrewModel.insertMany(newCrews);
      crews = [...existingCrews, ...createdCrews];
      console.log(`   ✅ ${createdCrews.length} cuadrillas creadas`);
    } else {
      console.log(`   ✅ Usando ${existingCrews.length} cuadrillas existentes`);
    }

    //? ============================================
    //? 2. CREAR REPORTES
    //? ============================================
    console.log(`\n📝 Creando ${DATA_COUNT} reportes...`);
    const reports = [];
    const reportStatuses = [
      "Pendiente",
      "Revisado",
      "Aceptado",
      "Completado",
      "Rechazado",
    ];

    for (let i = 0; i < DATA_COUNT; i++) {
      const type = randomChoice(REPORT_TYPES);
      const status = randomChoice(reportStatuses);
      const location = getRandomCoordinates();
      const createdDate = getRandomDate(DATE_RANGE_DAYS); // Fecha aleatoria en el rango configurado

      const report = {
        title: randomChoice(REPORT_TITLES[type]),
        description: randomChoice(REPORT_DESCRIPTIONS[type]),
        status: status,
        author: randomChoice(citizens)._id,
        assigned_operator:
          status !== "Pendiente" ? randomChoice(operators)._id : null,
        location: location,
        type_report: type,
        other_type_detail:
          type === "Otro" ? "Detalle adicional del reporte" : null,
        images: [], // Sin imágenes para este demo
        task_assigned: ["Aceptado", "Completado"].includes(status),
        approved_at: ["Aceptado", "Completado"].includes(status)
          ? new Date(
              createdDate.getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000
            ) // 0-30 días después de creación
          : null,
        completed_at:
          status === "Completado"
            ? new Date(
                createdDate.getTime() + Math.random() * 60 * 24 * 60 * 60 * 1000
              ) // 0-60 días después de creación
            : null,
        created_at: createdDate,
        updated_at: createdDate,
      };

      reports.push(report);
    }

    const createdReports = await ReportModel.insertMany(reports);
    console.log(`   ✅ ${createdReports.length} reportes creados`);

    //? ============================================
    //? 3. CREAR TAREAS (solo para reportes Aceptados/Completados)
    //? ============================================
    console.log(`\n📋 Creando tareas...`);
    const acceptedReports = createdReports.filter(
      (r) => r.status === "Aceptado" || r.status === "Completado"
    );

    const tasks = [];
    const tasksPerBatch = Math.floor(Math.random() * 2) + 1; // 1-2 reportes por tarea

    for (let i = 0; i < acceptedReports.length; i += tasksPerBatch) {
      const batchReports = acceptedReports.slice(i, i + tasksPerBatch);
      const firstReport = batchReports[0];
      const isCompleted = firstReport.status === "Completado";

      // La tarea se crea después de que el reporte fue aprobado
      const taskCreatedDate = firstReport.approved_at
        ? new Date(
            firstReport.approved_at.getTime() +
              Math.random() * 5 * 24 * 60 * 60 * 1000
          ) // 0-5 días después de aprobación
        : new Date(firstReport.created_at.getTime() + 10 * 24 * 60 * 60 * 1000); // o 10 días después de creación

      const task = {
        title: `Tarea: ${firstReport.title}`,
        crew: randomChoice(crews)._id,
        report: batchReports.map((r) => r._id),
        priority: randomChoice(PRIORITIES),
        status: isCompleted
          ? "Finalizada"
          : randomChoice(["Pendiente", "En Progreso"]),
        task_type: randomChoice(TASK_TYPES),
        assigned_operator: firstReport.assigned_operator,
        location: firstReport.location,
        created_at: taskCreatedDate,
        updated_at: taskCreatedDate,
      };

      tasks.push(task);
    }

    const createdTasks = await TaskModel.insertMany(tasks);
    console.log(`   ✅ ${createdTasks.length} tareas creadas`);

    //? ============================================
    //? 4. CREAR AVANCES/PROGRESS REPORTS
    //? ============================================
    console.log(`\n📊 Creando avances (progress reports)...`);
    const progressReports = [];

    for (const task of createdTasks) {
      // Número de avances según el estado de la tarea
      let progressCount;
      if (task.status === "Finalizada") {
        progressCount = Math.floor(Math.random() * 2) + 2; // 2-3 avances
      } else if (task.status === "En Progreso") {
        progressCount = Math.floor(Math.random() * 2) + 1; // 1-2 avances
      } else {
        progressCount = 0; // Tareas pendientes sin avances
      }

      const crew = await CrewModel.findById(task.crew);
      const worker = crew.leader; // El líder crea los progress reports

      for (let i = 0; i < progressCount; i++) {
        const isLast = i === progressCount - 1;
        const progressStatus =
          task.status === "Finalizada" && isLast
            ? "Finalizado"
            : randomChoice(["Pendiente", "En Progreso"]);

        // Cada avance se crea unos días después del anterior
        const daysOffset = i * (Math.floor(Math.random() * 5) + 3); // 3-7 días entre avances
        const progressDate = new Date(
          task.created_at.getTime() + daysOffset * 24 * 60 * 60 * 1000
        );

        const progress = {
          title: randomChoice(PROGRESS_TITLES),
          description: randomChoice(PROGRESS_DESCRIPTIONS),
          worker: worker,
          crew: crew._id,
          task: task._id,
          status: progressStatus,
          images: [], // Sin imágenes para este demo
          location: task.location,
          created_at: progressDate,
          updated_at: progressDate,
        };

        progressReports.push(progress);
      }
    }

    const createdProgress = await ProgressReportModel.insertMany(
      progressReports
    );
    console.log(`   ✅ ${createdProgress.length} avances creados`);

    //? ============================================
    //? RESUMEN FINAL
    //? ============================================
    console.log("\n" + "=".repeat(50));
    console.log("✨ GENERACIÓN DE DATOS COMPLETADA ✨");
    console.log("=".repeat(50));
    console.log(`\n📊 RESUMEN:`);
    console.log(`   - Cuadrillas: ${crews.length}`);
    console.log(`   - Reportes: ${createdReports.length}`);
    console.log(`   - Tareas: ${createdTasks.length}`);
    console.log(`   - Avances: ${createdProgress.length}`);
    console.log(`\n📍 Coordenadas generadas para: Formosa Capital, Argentina`);
    console.log(
      `   - Latitud: ${FORMOSA_BOUNDS.LAT_MIN} a ${FORMOSA_BOUNDS.LAT_MAX}`
    );
    console.log(
      `   - Longitud: ${FORMOSA_BOUNDS.LNG_MIN} a ${FORMOSA_BOUNDS.LNG_MAX}`
    );
    console.log(`\n🎯 Estado de los reportes:`);
    const statusCount = {};
    reportStatuses.forEach((status) => {
      statusCount[status] = createdReports.filter(
        (r) => r.status === status
      ).length;
    });
    Object.entries(statusCount).forEach(([status, count]) => {
      console.log(`   - ${status}: ${count}`);
    });

    console.log(`\n✅ Datos listos para la presentación al profesor`);
    console.log(`\n💡 Configuración:`);
    console.log(`   - DATA_COUNT = ${DATA_COUNT} (cantidad de reportes base)`);
    console.log(
      `   - DATE_RANGE_DAYS = ${DATE_RANGE_DAYS} (distribución en días)`
    );
    console.log(
      `   - Fechas generadas: ${new Date(
        Date.now() - DATE_RANGE_DAYS * 24 * 60 * 60 * 1000
      ).toLocaleDateString()} hasta ${new Date().toLocaleDateString()}\n`
    );
  } catch (error) {
    console.error("\n❌ ERROR:", error);
  } finally {
    await mongoose.disconnect();
    console.log("👋 Desconectado de MongoDB");
    process.exit(0);
  }
};

//* ============================================
//* EJECUTAR EL SCRIPT
//* ============================================
generateDemoData();

//* ============================================
//* INSTRUCCIONES DE USO
//* ============================================
// 1. Modificar la constante DATA_COUNT al inicio del archivo
// 2. Ejecutar: node script/generate-demo-data.js
// 3. Los datos se generarán automáticamente en la BD
// 4. Coordenadas dentro de los límites de Formosa Capital
