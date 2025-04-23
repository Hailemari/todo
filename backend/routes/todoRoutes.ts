import express from 'express';
import { protect } from '../middleware/authMiddleware';
import { uploadFields } from '../middleware/uploadMiddleware';
import {
  getTodos,
  createTodo,
  updateTodo,
  deleteTodo,
  getTodo
} from '../controllers/todoController';

const router = express.Router();

// Routes
router.route('/')
  .get(protect, getTodos)
  .post(protect, uploadFields, createTodo);

router.route('/:id')
  .get(protect, getTodo)
  .put(protect, uploadFields, updateTodo)
  .delete(protect, deleteTodo);

export default router;
