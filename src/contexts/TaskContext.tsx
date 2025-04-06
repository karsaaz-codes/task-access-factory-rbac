
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth, User } from './AuthContext';
import { toast } from 'sonner';

// Define task interface
export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  assignedTo: string; // user ID
  createdBy: string; // user ID
  createdAt: string;
  updatedAt: string;
}

// Task context interface
interface TaskContextType {
  tasks: Task[];
  userTasks: Task[];
  createTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTask: (taskId: string, updates: Partial<Omit<Task, 'id' | 'createdAt' | 'updatedAt'>>) => void;
  deleteTask: (taskId: string) => void;
}

// Initial mock tasks
const INITIAL_TASKS: Task[] = [
  {
    id: '1',
    title: 'Inspect Assembly Line A',
    description: 'Perform routine inspection of Assembly Line A and report any issues.',
    status: 'pending',
    priority: 'high',
    assignedTo: '1', // Assigned to John Worker
    createdBy: '3', // Created by Admin Manager
    createdAt: new Date(Date.now() - 86400000).toISOString(), // Yesterday
    updatedAt: new Date(Date.now() - 86400000).toISOString(), // Yesterday
  },
  {
    id: '2',
    title: 'Maintenance on Machine B',
    description: 'Perform scheduled maintenance on Machine B following standard procedure.',
    status: 'in-progress',
    priority: 'medium',
    assignedTo: '2', // Assigned to Jane Worker
    createdBy: '3', // Created by Admin Manager
    createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    updatedAt: new Date(Date.now() - 86400000).toISOString(), // Yesterday
  },
  {
    id: '3',
    title: 'Update Safety Documentation',
    description: 'Review and update safety procedures for the new equipment.',
    status: 'completed',
    priority: 'medium',
    assignedTo: '1', // Assigned to John Worker
    createdBy: '1', // Created by John Worker (own task)
    createdAt: new Date(Date.now() - 345600000).toISOString(), // 4 days ago
    updatedAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
  },
  {
    id: '4',
    title: 'Inventory Check',
    description: 'Perform monthly inventory check of raw materials.',
    status: 'pending',
    priority: 'low',
    assignedTo: '2', // Assigned to Jane Worker
    createdBy: '2', // Created by Jane Worker (own task)
    createdAt: new Date(Date.now() - 86400000).toISOString(), // Yesterday
    updatedAt: new Date(Date.now() - 86400000).toISOString(), // Yesterday
  },
];

// Create the task context
const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);

  // Load tasks from localStorage on initial render
  useEffect(() => {
    const savedTasks = localStorage.getItem('factory_tasks');
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    } else {
      // Initialize with mock data if no saved tasks
      setTasks(INITIAL_TASKS);
      localStorage.setItem('factory_tasks', JSON.stringify(INITIAL_TASKS));
    }
  }, []);

  // Filter tasks based on user role
  const userTasks = user 
    ? user.role === 'management'
      ? tasks // Management sees all tasks
      : tasks.filter(task => task.assignedTo === user.id) // Workers see only their tasks
    : [];

  // Create a new task
  const createTask = (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return;

    const now = new Date().toISOString();
    const newTask: Task = {
      ...task,
      id: Date.now().toString(),
      createdBy: user.id,
      createdAt: now,
      updatedAt: now,
    };

    const updatedTasks = [...tasks, newTask];
    setTasks(updatedTasks);
    localStorage.setItem('factory_tasks', JSON.stringify(updatedTasks));
    toast.success('Task created successfully');
  };

  // Update an existing task
  const updateTask = (
    taskId: string,
    updates: Partial<Omit<Task, 'id' | 'createdAt' | 'updatedAt'>>
  ) => {
    if (!user) return;

    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) {
      toast.error('Task not found');
      return;
    }

    // Check if user has permission to update this task
    const task = tasks[taskIndex];
    if (user.role !== 'management' && task.assignedTo !== user.id) {
      toast.error('You do not have permission to update this task');
      return;
    }

    const updatedTask = {
      ...task,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    const updatedTasks = [...tasks];
    updatedTasks[taskIndex] = updatedTask;
    
    setTasks(updatedTasks);
    localStorage.setItem('factory_tasks', JSON.stringify(updatedTasks));
    toast.success('Task updated successfully');
  };

  // Delete a task
  const deleteTask = (taskId: string) => {
    if (!user) return;

    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) {
      toast.error('Task not found');
      return;
    }

    // Check if user has permission to delete this task
    const task = tasks[taskIndex];
    if (user.role !== 'management' && task.assignedTo !== user.id) {
      toast.error('You do not have permission to delete this task');
      return;
    }

    const updatedTasks = tasks.filter(t => t.id !== taskId);
    setTasks(updatedTasks);
    localStorage.setItem('factory_tasks', JSON.stringify(updatedTasks));
    toast.success('Task deleted successfully');
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        userTasks,
        createTask,
        updateTask,
        deleteTask,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTask = () => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTask must be used within a TaskProvider');
  }
  return context;
};
