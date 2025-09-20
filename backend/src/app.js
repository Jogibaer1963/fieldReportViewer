import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import reportRoutes from "./routes/reportRoutes.js";

dotenv.config();
connectDB().then(r => console.log("DB connected"));

const app = express();
app.use(express.json());

app.use("/api/reports", reportRoutes);

export default app;
