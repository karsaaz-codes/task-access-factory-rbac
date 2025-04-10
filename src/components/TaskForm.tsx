
import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTask } from '@/contexts/TaskContext';
import { useAuth } from '@/contexts/AuthContext';

// Form schema using zod
const taskSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  assignedTo: z.string(),
});

type TaskFormValues = z.infer<typeof taskSchema>;

interface TaskFormProps {
  onClose: () => void;
  defaultAssignedTo?: string;
}

const TaskForm: React.FC<TaskFormProps> = ({ onClose, defaultAssignedTo }) => {
  const { createTask } = useTask();
  const { user, hasPermission } = useAuth();
  
  // Workers data (in a real app, this would come from the database)
  const workers = [
    { id: '1', name: 'John Worker' },
    { id: '2', name: 'Jane Worker' },
  ];

  // Initialize form with react-hook-form and zod validation
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      description: '',
      assignedTo: defaultAssignedTo || (hasPermission('add_task_to_any') ? '' : user?.id || ''),
    },
  });

  const onSubmit = (data: TaskFormValues) => {
    if (!user) return;
    
    // Since we've validated with zod schema, all required properties should be present
    createTask({
      title: data.title,
      description: data.description,
      assignedTo: data.assignedTo,
      createdBy: user.id
    });
    
    onClose();
  };

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
                <Input placeholder="Enter task title" {...field} />
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
                <Textarea
                  placeholder="Enter detailed task description"
                  className="min-h-32"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="assignedTo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Assigned To</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!hasPermission('add_task_to_any')}>
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
              {!hasPermission('add_task_to_any') && (
                <FormDescription>
                  As a worker, you can only create tasks for yourself.
                </FormDescription>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2 pt-2">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" className="bg-factory-blue hover:bg-factory-blue/90">
            Create Task
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default TaskForm;
