import express from "express";
import { getReports, updateTeam } from "../controllers/reportController.js";

const router = express.Router();

router.get("/", getReports);
router.patch("/:id/team", updateTeam);


export default router;
