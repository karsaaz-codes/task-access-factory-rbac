
import React, { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { useTask, Task } from '@/contexts/TaskContext';
import { useAuth } from '@/contexts/AuthContext';

// Form schema using zod
const taskSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  status: z.enum(['pending', 'in-progress', 'completed']),
  priority: z.enum(['low', 'medium', 'high']),
  assignedTo: z.string(),
});

type TaskDetailFormValues = z.infer<typeof taskSchema>;

interface TaskDetailProps {
  task: Task;
  onClose: () => void;
}

const TaskDetail: React.FC<TaskDetailProps> = ({ task, onClose }) => {
  const { updateTask } = useTask();
  const { user, hasPermission } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  
  // Can edit if management or if it's the user's own task
  const canEdit = hasPermission('modify_any_task') || 
                 (user?.id === task.assignedTo && hasPermission('view_own_tasks'));

  // Workers data (in a real app, this would come from the database)
  const workers = [
    { id: '1', name: 'John Worker' },
    { id: '2', name: 'Jane Worker' },
  ];

  // Initialize form with react-hook-form and zod validation
  const form = useForm<TaskDetailFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      assignedTo: task.assignedTo,
    },
  });

  const onSubmit = (data: TaskDetailFormValues) => {
    updateTask(task.id, data);
    setIsEditing(false);
  };

  const getWorkerName = (id: string) => {
    const worker = workers.find(w => w.id === id);
    return worker ? worker.name : 'Unknown Worker';
  };

  // Status badge styling
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Pending</Badge>;
      case 'in-progress':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">In Progress</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Priority badge styling
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'low':
        return <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100">Low</Badge>;
      case 'medium':
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Medium</Badge>;
      case 'high':
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">High</Badge>;
      default:
        return <Badge>{priority}</Badge>;
    }
  };

  if (isEditing) {
    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea className="min-h-32" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Priority</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {hasPermission('add_task_to_any') && (
            <FormField
              control={form.control}
              name="assignedTo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assigned To</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select worker" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {workers.map((worker) => (
                        <SelectItem key={worker.id} value={worker.id}>
                          {worker.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <div className="flex justify-end space-x-2 pt-2">
            <Button variant="outline" type="button" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-factory-blue hover:bg-factory-blue/90">
              Save Changes
            </Button>
          </div>
        </form>
      </Form>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold">{task.title}</h3>
          <div className="flex gap-2">
            {getStatusBadge(task.status)}
            {getPriorityBadge(task.priority)}
          </div>
        </div>
        <p className="text-sm text-gray-600 whitespace-pre-line mb-4">{task.description}</p>
      </div>

      <Separator />

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Assigned to:</span>
          <span className="font-medium">{getWorkerName(task.assignedTo)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Created:</span>
          <span>{format(new Date(task.createdAt), 'MMM d, yyyy h:mm a')}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Last updated:</span>
          <span>{format(new Date(task.updatedAt), 'MMM d, yyyy h:mm a')}</span>
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-2">
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
        {canEdit && (
          <Button onClick={() => setIsEditing(true)} className="bg-factory-blue hover:bg-factory-blue/90">
            Edit
          </Button>
        )}
      </div>
    </div>
  );
};

export default TaskDetail;
