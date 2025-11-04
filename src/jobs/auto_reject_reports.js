import ReportModel from "../models/report.model.js";
import cron from "node-cron";

// * Cambia el estado a "Rechazado" si lleva más de 1 día en "Revisado"
const autoRejectOldReviewedReports = async () => {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  await ReportModel.updateMany(
    { status: "Revisado", updated_at: { $lte: oneDayAgo } },
    { status: "Rechazado" }
  );
};

// * Ejecuta la función cada hora en punto
cron.schedule("0 */1 * * *", () => {
  // Tu función aquí
  autoRejectOldReviewedReports();
});
