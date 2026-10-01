import { SprintRepository } from "../repositories/sprint.repository.js";

export const getSprints = async (req, res, next) => {
  try {
    const sprints = await SprintRepository.getAll();
    res.json(sprints);
  } catch (err) {
    next(err);
  }
};

export const createSprint = async (req, res, next) => {
  try {
    const { name, goal, startDate, endDate } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Sprint name is required" });
    }

    const sprint = await SprintRepository.create({
      name: name.trim(),
      goal: goal ? goal.trim() : null,
      startDate: startDate || null,
      endDate: endDate || null,
    });
    res.status(201).json(sprint);
  } catch (err) {
    next(err);
  }
};

export const updateSprint = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, goal, startDate, endDate } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Sprint name is required" });
    }

    const updated = await SprintRepository.update(id, {
      name: name.trim(),
      goal: goal ? goal.trim() : null,
      startDate: startDate || null,
      endDate: endDate || null,
    });

    if (!updated) return res.status(404).json({ error: "Sprint not found" });
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

export const deleteSprint = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await SprintRepository.delete(id);
    if (!deleted) return res.status(404).json({ error: "Sprint not found" });
    res.json({ success: true, message: `Sprint ${id} deleted` });
  } catch (err) {
    next(err);
  }
};
