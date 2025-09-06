import Report from "../models/Report.js";
import { io } from "../server.js";


// @desc Get all reports
export const getReports = async (req, res) => {
  try {
    const reports = await Report.find();
    res.json(reports);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateTeam = async (req, res) => {
  try {
    const { id } = req.params;
    const { team } = req.body;

    console.log(id, team);

    if (typeof team !== "string" || team.trim() === "") {
      return res.status(400).json({ message: "team must be a non-empty string" });
    }

    const updated = await Report.findByIdAndUpdate(
      id,{ $set: { team: team.trim() } },{ new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Report not found" });
    }

    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const updateHide = async (req, res) => {
  try {
    const { id } = req.params;
    const { hideReport } = req.body;

    if (typeof hideReport !== "boolean") {
      return res.status(400).json({ message: "hideReport must be a boolean" });
    }

    const updated = await Report.findByIdAndUpdate(
      id,
      { $set: { hideReport } },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Report not found" });
    }

    io.emit('reportHidden', { _id: updated._id, hideReport: updated.hideReport });


    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};



