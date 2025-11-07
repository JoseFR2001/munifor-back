import { Router } from "express";
import { getMapaData } from "../controllers/map.controller.js";

const mapRoutes = Router();

mapRoutes.get("/map/data", getMapaData);

export default mapRoutes;
