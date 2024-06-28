import { supabase } from './supabaseClient';
import type { Task } from './type';

// Create a new task in the Supabase table
export const createTask = async (task: Omit<Task, 'id' | 'created_at'>): Promise<Task | null> => {
  const { data, error } = await supabase.from('tasks').insert(task).single();
  if (error) {
    console.error('Error creating task:', error);
    return null;
  }
  return data;
};

// Fetch tasks for a specific user from the Supabase table
export const readTask = async (userId: string): Promise<Task[]> => {
  const { data, error } = await supabase.from('tasks').select('*').eq('user_id', userId);
  if (error) {
    console.error('Error reading tasks:', error);
    return [];
  }
  return data;
};

// Update a task in the Supabase table
export const updateTask = async (id: string, task: Partial<Omit<Task, 'id' | 'user_id' | 'created_at'>>): Promise<Task | null> => {
  const { data, error } = await supabase.from('tasks').update(task).eq('id', id).single();
  if (error) {
    console.error('Error updating task:', error);
    return null;
  }
  return data;
};

// Delete a task from the Supabase table
export const deleteTask = async (id: string): Promise<{ message: string } | null> => {
  const { error } = await supabase.from('tasks').delete().eq('id', id);
  if (error) {
    console.error('Error deleting task:', error);
    return null;
  }
  return { message: 'Task deleted successfully' };
};
