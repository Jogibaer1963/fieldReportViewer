import mongoose from "mongoose";

const reportSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  machine: { type: String, required: true },
  country: { type: String },
  report: { type: String, required: true },
  status: { type: String, required: false },
  engineHours: { type: String },
  repairDate: { type: String },
  partName: { type:String },
  grossLaborParts: { type:String },
  failure: { type: String },
  remedy: { type: String },
  longTextExtra: { type: String },
  team: {type: String },
  hideReport: {type: Boolean, default: false},
}, { timestamps: true, collection: "fieldReports" });

export default mongoose.model("Report", reportSchema);
