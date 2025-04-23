# Todo Application

This is a full-stack Todo application built with React.js for the frontend and Express.js for the backend. The application allows users to securely log in and manage their personal to-do items, with support for media upload, search, tagging, and more.

## Features

- User Authentication with JWT
- Create, Read, Update, Delete (CRUD) operations for Todos
- Image uploads for todo thumbnails
- File attachments for todos
- Tag management for todos
- Search functionality
- Pagination
- User-specific todos

## Tech Stack

### Frontend
- React.js
- Ant Design for UI components
- Axios for API requests
- React Router Dom for routing

### Backend
- Express.js
- MongoDB with Mongoose
- JSON Web Tokens (JWT) for authentication
- Multer for file uploads
- Zod for validation

## Project Structure

```
Eskalate/
├── frontend/                 # React frontend application
│   ├── public/               # Public assets
│   ├── src/                  # Source files
│   │   ├── components/       # Reusable components
│   │   │   ├── PrivateRoute.tsx
│   │   │   ├── TodoForm.tsx
│   │   │   └── TodoList.tsx
│   │   ├── pages/            # Page components
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Login.tsx
│   │   │   └── Register.tsx
│   │   ├── services/         # API services
│   │   │   └── api.ts
│   │   ├── App.css           # Global styles for the app
│   │   ├── App.tsx           # Main App component
│   │   ├── index.css         # Global CSS styles
│   │   ├── index.tsx         # Entry point
│   │   └── vite-env.d.ts     # Vite environment types
│   ├── tsconfig.app.json     # TypeScript configuration for the app
│   ├── tsconfig.json         # TypeScript base configuration
│   ├── tsconfig.node.json    # TypeScript configuration for Node.js
│   ├── package.json          # Frontend dependencies and scripts
│   ├── Dockerfile            # Dockerfile for the frontend
│   ├── vite.config.ts        # Vite configuration
│   ├── nginx.conf            # Nginx configuration for production
│   └── index.html            # HTML entry point
├── backend/                  # Express backend application
│   ├── controllers/          # Route controllers
│   │   ├── todoController.ts
│   │   └── userController.ts
│   ├── middleware/           # Express middleware
│   │   ├── authMiddleware.ts
│   │   ├── errorMiddleware.ts
│   │   └── uploadMiddleware.ts
│   ├── models/               # Mongoose models
│   │   ├── todoModel.ts
│   │   └── userModel.ts
│   ├── routes/               # Express routes
│   │   ├── todoRoutes.ts
│   │   └── userRoutes.ts
│   ├── types/                # TypeScript type definitions
│   │   ├── express.d.ts
│   │   └── multer.d.ts
│   ├── uploads/              # Uploaded files
│   ├── .env                  # Environment variables
│   ├── Dockerfile            # Dockerfile for the backend
│   ├── index.ts              # Entry point
│   ├── package.json          # Backend dependencies and scripts
│   └── tsconfig.json         # TypeScript configuration
├── docker-compose.yml        # Docker Compose configuration
└── README.md                 # Project documentation
```

## Running Instructions

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory with the following variables:
```
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/todo-app
JWT_SECRET=your_jwt_secret_here
```

4. Start the backend server:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend/todo
```

2. Install dependencies:
```bash
npm install
```

3. Start the frontend development server:
```bash
npm run dev
```

## Database Setup

1. Install MongoDB locally or use MongoDB Atlas.

2. If using local MongoDB, make sure the MongoDB service is running.

3. Connect to your MongoDB instance and create a database named `todo-app`.

4. The application will create the necessary collections automatically.

### Creating a User Manually

You can create a user through the application's registration page, or manually using MongoDB shell:

```javascript
use todo-app
db.users.insertOne({
  name: "Test User",
  email: "test@example.com",
  password: "$2a$10$XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX", // Bcrypt hashed password
  createdAt: new Date(),
  updatedAt: new Date()
})
```

Note: For manual user creation, you'll need to hash the password using bcrypt. It's recommended to use the application's registration page instead.

## API Endpoints

### Authentication
- `POST /api/users` - Register a new user
- `POST /api/users/login` - Login a user
- `GET /api/users/me` - Get current user profile

### Todos
- `GET /api/todos` - Get all todos for the logged-in user
- `POST /api/todos` - Create a new todo
- `GET /api/todos/:id` - Get a specific todo
- `PUT /api/todos/:id` - Update a todo
- `DELETE /api/todos/:id` - Delete a todo

## Bonus Features Implemented

- Search and filter functionality
- File and image uploads
- Tags support
- Pagination

## License

This project is open-source and available under the MIT License.