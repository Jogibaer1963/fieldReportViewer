import mongoose from "mongoose";

const reportSchema = new mongoose.Schema({
  machine: { type: String, required: true },
  country: { type: String },
  report: { type: String, required: true },
  status: { type: String, required: false },
  engineHours: { type: String },
}, { timestamps: true, collection: "fieldReports" });

export default mongoose.model("Report", reportSchema);
