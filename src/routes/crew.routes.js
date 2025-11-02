import { Router } from "express";
import {
  createCrew,
  deleteCrew,
  getAllCrews,
  getCrewById,
  updateCrew,
} from "../controllers/crew.controller.js";

const crewRouter = Router();

crewRouter.post("/crew", createCrew);
crewRouter.get("/crews", getAllCrews);
crewRouter.get("/crew/:id", getCrewById);
crewRouter.put("/crew/:id", updateCrew);
crewRouter.delete("/crew/:id", deleteCrew);

export default crewRouter;
