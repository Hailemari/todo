import express, { Application } from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import path from 'path';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorMiddleware';
import todoRoutes from './routes/todoRoutes';
import userRoutes from './routes/userRoutes';

dotenv.config();

const app: Application = express();

// Get MongoDB URI from environment variables
const mongoURI = process.env.MONGO_URI as string;

// Connect to MongoDB using Mongoose
mongoose.connect(mongoURI, {
  serverApi: {
    version: '1',  // Set the Stable API version
    strict: true,
    deprecationErrors: true,
  }
})
  .then(() => console.log('MongoDB Connected'))
  .catch((err: any) => console.error('MongoDB connection error:', err));

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Static file serving
// Update static file serving configuration
const uploadsDir = path.join(__dirname, '..', 'uploads');
app.use('/uploads', express.static(uploadsDir));


// Routes
app.use('/api/todos', todoRoutes);
app.use('/api/users', userRoutes);

// Error handler
app.use(errorHandler);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
