import axios, { AxiosResponse } from 'axios';

const API_URL = 'http://localhost:5000/api';

interface UserData {
  email: string;
  password: string;
  name?: string;
  token?: string;
}

interface TodoData {
  _id?: string;
  title: string;
  description?: string;
  completed?: boolean;
  tags?: string[];
  image?: File | Blob;
  file?: File | Blob | undefined;
}

interface PaginationData {
  page: number;
  limit: number;
  totalPages: number;
  totalCount: number;
}

interface TodosResponse {
  todos: TodoData[];
  pagination: PaginationData;
}

// Create axios instance
const api = axios.create({
  baseURL: API_URL
});

// Add request interceptor for authorization
api.interceptors.request.use(
  (config) => {
    const userString = localStorage.getItem('user');
    if (userString) {
      const user = JSON.parse(userString);
      if (user && user.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth API
export const register = async (userData: UserData): Promise<UserData> => {
  const response: AxiosResponse<UserData> = await api.post('/users', userData);
  return response.data;
};

export const login = async (userData: { email: string; password: string }): Promise<UserData> => {
  const response: AxiosResponse<UserData> = await api.post('/users/login', userData);
  return response.data;
};

// Todo API
export const getTodos = async (
  page: number = 1, 
  limit: number = 10, 
  search: string = '', 
  tag: string = ''
): Promise<TodosResponse> => {
  const response: AxiosResponse<TodosResponse> = await api.get('/todos', {
    params: { page, limit, search, tag }
  });
  return response.data;
};

export const createTodo = async (formData: FormData | TodoData): Promise<TodoData> => {
  // If formData is already a FormData object, use it directly
  if (formData instanceof FormData) {
    // Get the title for validation
    const title = formData.get('title') as string;
    if (!title || title.trim() === '' || title === 'undefined') {
      throw new Error('Title is required and cannot be "undefined"');
    }
    
    const response: AxiosResponse<TodoData> = await api.post('/todos', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }
  
  // Otherwise, create a new FormData object
  const data = new FormData();

  // Validate title before adding to formData
  if (!formData.title || formData.title.trim() === '' || formData.title === 'undefined') {
    throw new Error('Title is required and cannot be "undefined"');
  }

  data.append('title', formData.title.trim());
  if (formData.description) data.append('description', formData.description);
  data.append('completed', String(!!formData.completed));

  // Handle tags
  if (formData.tags && formData.tags.length > 0) {
    formData.tags.forEach(tag => {
      data.append('tags[]', tag);
    });
  }

  // Handle files
  if (formData.image && Array.isArray(formData.image) && formData.image.length > 0 && formData.image[0].originFileObj) {
    data.append('image', formData.image[0].originFileObj);
  }

  if (formData.file && Array.isArray(formData.file) && formData.file.length > 0 && formData.file[0].originFileObj) {
    data.append('file', formData.file[0].originFileObj);
  }

  const response: AxiosResponse<TodoData> = await api.post('/todos', data, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });

  return response.data;
};

export const updateTodo = async (id: string, formData: FormData | TodoData): Promise<TodoData> => {
  // If formData is already a FormData object, use it directly
  if (formData instanceof FormData) {
    // Get the title for validation if it exists
    const title = formData.get('title') as string | null;
    if (title !== null && (title.trim() === '' || title === 'undefined')) {
      throw new Error('Title cannot be empty or "undefined"');
    }
    
    const response: AxiosResponse<TodoData> = await api.put(`/todos/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }
  
  // Otherwise, create a new FormData object
  const data = new FormData();

  // Validate title before adding to formData
  if (formData.title !== undefined) {
    if (formData.title.trim() === '' || formData.title === 'undefined') {
      throw new Error('Title cannot be empty or "undefined"');
    }
    data.append('title', formData.title.trim());
  }
  
  if (formData.description !== undefined) data.append('description', formData.description);
  if (formData.completed !== undefined) data.append('completed', String(!!formData.completed));

  // Handle tags
  if (formData.tags && formData.tags.length > 0) {
    formData.tags.forEach(tag => {
      data.append('tags[]', tag);
    });
  }

  // Handle files
  if (formData.image && Array.isArray(formData.image) && formData.image.length > 0 && formData.image[0].originFileObj) {
    data.append('image', formData.image[0].originFileObj);
  }

  if (formData.file && Array.isArray(formData.file) && formData.file.length > 0 && formData.file[0].originFileObj) {
    data.append('file', formData.file[0].originFileObj);
  }

  const response: AxiosResponse<TodoData> = await api.put(`/todos/${id}`, data, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });

  return response.data;
};

export const deleteTodo = async (id: string): Promise<{id: string}> => {
  const response: AxiosResponse<{id: string}> = await api.delete(`/todos/${id}`);
  return response.data;
};

export const getTodo = async (id: string): Promise<TodoData> => {
  const response: AxiosResponse<TodoData> = await api.get(`/todos/${id}`);
  return response.data;
};

export default api;