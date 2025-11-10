import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import initDb from "./src/config/database.js";
import router from "./src/routes/index.js";

// Importa la tarea automática para rechazar reportes
import "./src/jobs/auto_reject_reports.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT;

app.use(express.json());
app.use(cors());

// Servir archivos estáticos (imágenes)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api", router);

initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en ${PORT}`);
  });
});
