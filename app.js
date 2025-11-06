import "dotenv/config";
import express from "express";
import cors from "cors";
import initDb from "./src/config/database.js";
import router from "./src/routes/index.js";

// Importa la tarea automática para rechazar reportes
import "./src/jobs/auto_reject_reports.js";

const app = express();
const PORT = process.env.PORT;

app.use(express.json());
app.use(cors());

app.use("/api", router);

initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en ${PORT}`);
  });
});
