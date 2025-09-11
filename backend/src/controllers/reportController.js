import Report from "../models/Report.js";

// -----------------------------------------------------------------------------
// ES-module exports for every handler
// -----------------------------------------------------------------------------

// @desc Get all reports
export const getReports = async (req, res) => {
  try {
    const reports = await Report.find();
    res.json(reports);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateTeam = async (req, res, next) => {   // <-- changed
  try {
    const { id } = req.params;
    const { team } = req.body;

    const updated = await Report.findByIdAndUpdate(
      id,
      { team },
      { new: true }
    );

    req.app.get("io")?.emit("reportUpdated", updated);
    res.json(updated);
  } catch (err) {
    next(err);
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

    req.app.get("io")?.emit("reportHidden", { _id: updated._id, hideReport });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};



