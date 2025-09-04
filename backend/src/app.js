import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import reportRoutes from "./routes/reportRoutes.js";

import path from "node:path";
import { fileURLToPath } from "node:url";

import cors from "cors";



const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env") });


connectDB().then(()=>console.log("DB connected"));

const app = express();

app.use(cors({ origin: "http://localhost:4200" }));

app.use(express.json());

app.use("/api/reports", reportRoutes);

export default app;
