import { Router } from 'express';
import { 
  getSprintTasks, 
  updateTaskPosition, 
  assignTaskUser,
  getUsers,
  createTask,
  createUser,
  deleteTask,
  updateTaskDetails,
  updateUser,
  deleteUser
} from '../controllers/task.controller.js';
import {
  getSprints,
  createSprint,
  updateSprint,
  deleteSprint,
} from '../controllers/sprint.controller.js';

const router = Router();

// Sprint routes
router.get('/sprints', getSprints);
router.post('/sprints', createSprint);
router.patch('/sprints/:id', updateSprint);
router.delete('/sprints/:id', deleteSprint);

// User routes
router.get('/users', getUsers);
router.post('/users', createUser);
router.patch('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

// Task routes
router.get('/sprints/:sprintId/tasks', getSprintTasks);
router.post('/tasks', createTask);
router.patch('/tasks/:id', updateTaskDetails);
router.patch('/tasks/:id/position', updateTaskPosition);
router.patch('/tasks/:id/assign', assignTaskUser);
router.delete('/tasks/:id', deleteTask);

export default router;