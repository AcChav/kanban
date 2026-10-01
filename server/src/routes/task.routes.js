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

const router = Router();

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