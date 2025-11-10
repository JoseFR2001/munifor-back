import { Router } from "express";
import {
  getMapaData,
  getMapaOperatorData,
} from "../controllers/map.controller.js";

const mapRoutes = Router();

mapRoutes.get("/map/data", getMapaData);
mapRoutes.get("/map/operator-data", getMapaOperatorData);

export default mapRoutes;
