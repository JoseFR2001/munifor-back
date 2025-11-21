import { Router } from "express";
import { getGlobalView } from "../controllers/global_view.controller.js";

const globalViewRouter = Router();

globalViewRouter.get("/admin/globalview", getGlobalView);

export default globalViewRouter;
