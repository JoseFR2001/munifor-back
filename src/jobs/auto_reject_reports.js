//* ============================================
//* CRON JOB - AUTO-RECHAZO DE REPORTES ANTIGUOS
//* ============================================

//! IMPORTS DE DEPENDENCIAS
import ReportModel from "../models/report.model.js";
import cron from "node-cron"; // Biblioteca para programar tareas automáticas

//* ============================================
//* FUNCIÓN DE AUTO-RECHAZO
//* ============================================

/**
 * Rechaza automáticamente reportes que llevan más de 1 día en estado "Revisado"
 *
 * Lógica:
 * - Si un reporte está en "Revisado" y no fue actualizado en las últimas 24 horas
 * - Se cambia automáticamente a "Rechazado"
 * - Esto evita que reportes queden en limbo indefinidamente
 */
const autoRejectOldReviewedReports = async () => {
  //? Calcular fecha de hace 1 día (24 horas)
  // Date.now() = timestamp actual en milisegundos
  // 24 * 60 * 60 * 1000 = 24 horas en milisegundos
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  //? Actualizar múltiples reportes a la vez
  // Condiciones:
  // - status debe ser "Revisado"
  // - updated_at debe ser menor o igual ($lte) a hace 1 día
  // Acción:
  // - Cambiar status a "Rechazado"
  await ReportModel.updateMany(
    { status: "Revisado", updated_at: { $lte: oneDayAgo } },
    { status: "Rechazado" }
  );
};

//* ============================================
//* PROGRAMACIÓN DEL CRON JOB
//* ============================================

//? Ejecuta la función cada hora en punto
// Sintaxis de cron: "minuto hora dia mes dia-semana"
// "0 */1 * * *" significa:
// - 0: en el minuto 0
// - */1: cada 1 hora
// - *: cualquier día del mes
// - *: cualquier mes
// - *: cualquier día de la semana
// Resultado: Ejecuta cada hora (00:00, 01:00, 02:00, etc.)
cron.schedule("0 */1 * * *", () => {
  //? Ejecutar la función de auto-rechazo
  autoRejectOldReviewedReports();
  console.log("✓ Cron job ejecutado: Auto-rechazo de reportes antiguos");
});

//* ============================================
//* TRADUCCIÓN DE CONSTANTES
//* ============================================
// cron = Programa de tareas automáticas
// schedule = programar/agendar
// autoRejectOldReviewedReports = auto-rechazar reportes revisados antiguos
// oneDayAgo = hace un día
// Date.now() = fecha/hora actual
// updateMany = actualizar múltiples documentos
// $lte = Less Than or Equal (menor o igual que)
// updated_at = actualizado en (fecha)
// status = estado
// "0 */1 * * *" = patrón de tiempo (cada hora en punto)
