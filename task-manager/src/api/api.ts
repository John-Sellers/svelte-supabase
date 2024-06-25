import type { Task } from '../type';

const API_BASE_URL = 'https://your-buildship-api-endpoint.com';

export const createTask = async (task: Omit<Task, 'id' | 'created_at'>): Promise<Task> => {
  const response = await fetch(`${API_BASE_URL}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(task),
  });
  return response.json();
};

export const updateTask = async (id: string, task: Partial<Omit<Task, 'id' | 'user_id' | 'created_at'>>): Promise<Task> => {
  const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(task),
  });
  return response.json();
};

export const deleteTask = async (id: string): Promise<{ message: string }> => {
  const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
    method: 'DELETE',
  });
  return response.json();
};

export const getTasks = async (userId: string): Promise<Task[]> => {
  const response = await fetch(`${API_BASE_URL}/tasks?user_id=${userId}`);
  return response.json();
};
