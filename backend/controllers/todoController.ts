import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { z, ZodError } from 'zod';
import fs from 'fs';
import path from 'path';
import Todo from '../models/todoModel';
import { Types, ObjectId } from 'mongoose';


const getStoredFileName = (file?: Express.Multer.File) => 
  file ? file.filename : null;


// Types
interface TodoRequest extends Request {
  user: { id: string };
  files?: { image?: Express.Multer.File[]; file?: Express.Multer.File[] }; // Handle files
}

interface TodoDocument {
  _id: ObjectId;
  title: string;
  description?: string;
  completed?: boolean;
  tags?: string[];
  imagePath?: string;
  filePath?: string;
  user: ObjectId;  // Use ObjectId for Mongoose
}

// Validation schemas
const todoSchema = z.object({
  title: z.string()
    .min(1, "Title is required")
    .refine(value => value !== "undefined" && value.trim() !== "", {
      message: "Title cannot be empty or 'undefined'"
    }),
  description: z.string().optional(),
  completed: z.union([
    z.boolean(),
    z.string().transform(val => val === 'true')
  ]).optional(),
  tags: z.array(z.string()).optional(),
});

// @desc    Get todos
// @route   GET /api/todos
// @access  Private
export const getTodos = asyncHandler(async (req: TodoRequest, res: Response): Promise<void> => {
  const page: number = parseInt(req.query.page as string) || 1;
  const limit: number = parseInt(req.query.limit as string) || 10;
  const skip: number = (page - 1) * limit;
  
  const searchQuery: string = req.query.search as string;
  const tagFilter: string = req.query.tag as string;
  
  let query: Record<string, any> = { user: new Types.ObjectId(req.user.id) };
  
  // Add search functionality
  if (searchQuery && searchQuery.trim() !== '') {
    query = { 
      ...query, 
      $or: [
        { title: { $regex: searchQuery, $options: 'i' } },
        { description: { $regex: searchQuery, $options: 'i' } }
      ]
    };
  }
  
  // Add tag filtering
  if (typeof tagFilter === 'string' && tagFilter.trim()) {
    query.tags = tagFilter;
  }  
  
  // Get todos
  const todos = await Todo.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
  
  // Get total count
  const totalCount = await Todo.countDocuments(query);
  
  res.status(200).json({
    todos,
    pagination: {
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
      totalCount,
    },
  });
});

// @desc    Create todo
// @route   POST /api/todos
// @access  Private
export const createTodo = asyncHandler(async (req: TodoRequest, res: Response) => {
  console.log('FILES RECEIVED:', req.files);

  try {
    // Parse form data properly
    const formData = {
      title: req.body.title,
      description: req.body.description || '',
      completed: req.body.completed === 'true',
      tags: Array.isArray(req.body.tags) ? req.body.tags : 
            (req.body['tags[]'] ? (Array.isArray(req.body['tags[]']) ? 
                                 req.body['tags[]'] : [req.body['tags[]']]) : [])
    };
    
    // Validate request body
    const validatedData = todoSchema.parse(formData);
    
    // Create todo
    const todo = await Todo.create({
      ...validatedData,
      user: new Types.ObjectId(req.user.id),
      imagePath: getStoredFileName(req.files?.image?.[0]),
      filePath: getStoredFileName(req.files?.file?.[0]),
    }) as unknown as TodoDocument;
    
    res.status(201).json(todo);
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ message: error.errors[0].message });
    } else {
      throw error;
    }
  }
});

// @desc    Update todo
// @route   PUT /api/todos/:id
// @access  Private
export const updateTodo = asyncHandler(async (req: TodoRequest, res: Response) => {
  const todo = await Todo.findById(req.params.id);
  
  if (!todo) {
    res.status(404);
    throw new Error('Todo not found');
  }
  
  // Make sure the logged in user matches the todo user
  if (todo.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('User not authorized');
  }
  
  try {
    // Parse form data properly
    const formData = {
      title: req.body.title,
      description: req.body.description || '',
      completed: req.body.completed === 'true',
      tags: Array.isArray(req.body.tags) ? req.body.tags : 
            (req.body['tags[]'] ? (Array.isArray(req.body['tags[]']) ? 
                                 req.body['tags[]'] : [req.body['tags[]']]) : [])
    };
    
    // Validate request body
    const validatedData = todoSchema.parse(formData);
    
    // Handle file updates
    let updateData: Partial<TodoDocument> = { ...validatedData };
    
    if (req.files?.image) {
      // Delete old image if exists
      if (todo.imagePath && fs.existsSync(todo.imagePath)) {
        fs.unlinkSync(todo.imagePath);
      }
      updateData.imagePath = getStoredFileName(req.files?.image?.[0]);
    }
    
    if (req.files?.file) {
      // Delete old file if exists
      if (todo.filePath && fs.existsSync(todo.filePath)) {
        fs.unlinkSync(todo.filePath);
      }
      updateData.filePath = getStoredFileName(req.files?.file?.[0]);
    }
    
    const updatedTodo = await Todo.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    
    res.status(200).json(updatedTodo);
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ message: error.errors[0].message });
    } else {
      throw error;
    }
  }
});

// @desc    Delete todo
// @route   DELETE /api/todos/:id
// @access  Private
export const deleteTodo = asyncHandler(async (req: TodoRequest, res: Response) => {
  const todo = await Todo.findById(req.params.id);
  
  if (!todo) {
    res.status(404);
    throw new Error('Todo not found');
  }
  
  // Make sure the logged in user matches the todo user
  if (todo.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('User not authorized');
  }
  
  // Delete associated files
  if (todo.imagePath && fs.existsSync(todo.imagePath)) {
    fs.unlinkSync(todo.imagePath);
  }
  
  if (todo.filePath && fs.existsSync(todo.filePath)) {
    fs.unlinkSync(todo.filePath);
  }
  
  await todo.deleteOne();
  
  res.status(200).json({ id: req.params.id });
});

// @desc    Get a specific todo
// @route   GET /api/todos/:id
// @access  Private
export const getTodo = asyncHandler(async (req: TodoRequest, res: Response) => {
  const todo = await Todo.findById(req.params.id);
  
  if (!todo) {
    res.status(404);
    throw new Error('Todo not found');
  }
  
  // Make sure the logged in user matches the todo user
  if (todo.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('User not authorized');
  }
  
  res.status(200).json(todo);
});