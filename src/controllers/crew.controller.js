import CrewModel from "../models/crew.model.js";

export const createCrew = async (req, res) => {
  try {
    const newCrew = await CrewModel.create(req.body);
    return res.status(201).json({
      ok: true,
      crew: newCrew,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      msg: "Error interno del servidor",
    });
  }
};

export const getAllCrews = async (req, res) => {
  try {
    const crews = await CrewModel.find();
    return res.status(200).json({
      ok: true,
      crews,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      msg: "Error interno del servidor",
    });
  }
};

export const getCrewById = async (req, res) => {
  const { id } = req.params;
  try {
    const crew = await CrewModel.findById(id);
    return res.status(200).json({
      ok: true,
      crew,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      msg: "Error interno del servidor",
    });
  }
};

export const getCrewWorker = async (req, res) => {
  const { memberId } = req.params;
  // ! Debo modificar esto para que tome el id del user logueado
  try {
    const crew = await CrewModel.findOne({ members: memberId });
    return res.status(200).json({
      ok: true,
      crew,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      msg: "Error interno del servidor",
    });
  }
};

export const updateCrew = async (req, res) => {
  const { id } = req.params;
  try {
    const updatedCrew = await CrewModel.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    return res.status(200).json({
      ok: true,
      crew: updatedCrew,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      msg: "Error interno del servidor",
    });
  }
};

export const deleteCrew = async (req, res) => {
  const { id } = req.params;
  try {
    await CrewModel.findByIdAndDelete(id);
    return res.status(200).json({
      ok: true,
      msg: "Crew deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      msg: "Internal server error",
    });
  }
};
