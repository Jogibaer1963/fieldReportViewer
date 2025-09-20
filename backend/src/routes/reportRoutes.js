import express from "express";
import { getReports, updateHide, updateTeam } from "../controllers/reportController.js";

const router = express.Router();

router.get("/", getReports);
router.patch("/:id/team", updateTeam);
router.patch("/:id/hide", updateHide);

export default router;
