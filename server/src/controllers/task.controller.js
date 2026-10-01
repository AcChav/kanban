import { TaskRepository } from '../repositories/task.repository.js';

export const getSprintTasks = async (req, res, next) => {
  try {
    const { sprintId } = req.params;
    const tasks = await TaskRepository.getBySprint(sprintId);
    res.json(tasks);
  } catch (err) {
    next(err);
  }
};

export const updateTaskPosition = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, position } = req.body;

    if (!status || position === undefined) {
      return res.status(400).json({ error: 'status and position are required' });
    }

    const updatedTask = await TaskRepository.updateTaskPosition({
      taskId: id,
      targetStatus: status,
      targetPosition: Number(position)
    });

    res.json(updatedTask);
  } catch (err) {
    next(err);
  }
};

export const assignTaskUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { userId } = req.body; // Can be null to unassign

    const updatedTask = await TaskRepository.assignUser(id, userId || null);
    res.json(updatedTask);
  } catch (err) {
    next(err);
  }
};

export const getUsers = async (req, res, next) => {
  try {
    const users = await TaskRepository.getAllUsers();
    res.json(users);
  } catch (err) {
    next(err);
  }
};

export const createTask = async (req, res, next) => {
  try {
    const { sprintId, title, description, status, priority, assignedUserId } = req.body;

    if (!sprintId || !title) {
      return res.status(400).json({ error: 'sprintId and title are required' });
    }

    const newTask = await TaskRepository.create({
      sprintId,
      title,
      description,
      status: status || 'TODO',
      priority: priority || 'MEDIUM',
      assignedUserId: assignedUserId ? Number(assignedUserId) : null
    });

    res.status(201).json(newTask);
  } catch (err) {
    next(err);
  }
};

export const createUser = async (req, res, next) => {
  try {
    const { name, avatarUrl } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const newUser = await TaskRepository.createUser({
      name: name.trim(),
      avatarUrl: avatarUrl ? avatarUrl.trim() : null
    });

    res.status(201).json(newUser);
  } catch (err) {
    next(err);
  }
};

export const deleteTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await TaskRepository.delete(id);

    if (!deleted) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json({ success: true, message: `Task ${id} deleted` });
  } catch (err) {
    next(err);
  }
};

export const updateTaskDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, priority } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const updated = await TaskRepository.updateDetails(id, {
      title: title.trim(),
      description: description ? description.trim() : null,
      priority: priority || undefined
    });
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const updated = await TaskRepository.updateUser(id, name.trim());
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    await TaskRepository.deleteUser(id);
    res.json({ success: true, message: `User ${id} deleted` });
  } catch (err) {
    next(err);
  }
};