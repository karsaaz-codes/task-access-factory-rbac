
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useTask, Task } from '@/contexts/TaskContext';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import DashboardLayout from '@/components/DashboardLayout';
import TaskForm from '@/components/TaskForm';
import TaskDetail from '@/components/TaskDetail';
import { CheckCircle2, Clock, ListPlus, MoreVertical, AlertCircle } from 'lucide-react';

const Dashboard = () => {
  const { userTasks } = useTask();
  const { user } = useAuth();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [isTaskDetailOpen, setIsTaskDetailOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const { deleteTask } = useTask();

  const pendingTasks = userTasks.filter(task => task.status === 'pending');
  const inProgressTasks = userTasks.filter(task => task.status === 'in-progress');
  const completedTasks = userTasks.filter(task => task.status === 'completed');

  const handleDeleteConfirm = () => {
    if (taskToDelete) {
      deleteTask(taskToDelete);
      setTaskToDelete(null);
    }
  };

  const handleOpenTaskDetail = (task: Task) => {
    setSelectedTask(task);
    setIsTaskDetailOpen(true);
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header and stats */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Welcome, {user?.name}</h1>
            <p className="text-muted-foreground">Manage your factory tasks from here</p>
          </div>

          <div className="flex items-center gap-2">
            <Dialog open={isTaskFormOpen} onOpenChange={setIsTaskFormOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-factory-blue hover:bg-factory-blue/90">
                  <ListPlus className="h-4 w-4 mr-2" />
                  Add Task
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Create New Task</DialogTitle>
                </DialogHeader>
                <TaskForm onClose={() => setIsTaskFormOpen(false)} />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-base font-medium flex items-center">
                <Clock className="h-5 w-5 mr-2 text-amber-500" />
                Pending Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{pendingTasks.length}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-base font-medium flex items-center">
                <AlertCircle className="h-5 w-5 mr-2 text-blue-500" />
                In Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{inProgressTasks.length}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-base font-medium flex items-center">
                <CheckCircle2 className="h-5 w-5 mr-2 text-green-500" />
                Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{completedTasks.length}</p>
            </CardContent>
          </Card>
        </div>

        {/* All Tasks */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Your Tasks</h2>
          <TaskListContent 
            tasks={userTasks} 
            getStatusBadge={getStatusBadge}
            onTaskClick={handleOpenTaskDetail}
            setTaskToDelete={setTaskToDelete}
          />
        </div>
      </div>

      {/* Task Detail Dialog */}
      <Dialog open={isTaskDetailOpen} onOpenChange={setIsTaskDetailOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Task Details</DialogTitle>
          </DialogHeader>
          {selectedTask && <TaskDetail task={selectedTask} onClose={() => setIsTaskDetailOpen(false)} />}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!taskToDelete} onOpenChange={(open) => !open && setTaskToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this task?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The task will be permanently deleted from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

// Task list component
const TaskListContent: React.FC<{
  tasks: Task[];
  getStatusBadge: (status: string) => React.ReactNode;
  onTaskClick: (task: Task) => void;
  setTaskToDelete: (taskId: string) => void;
}> = ({ tasks, getStatusBadge, onTaskClick, setTaskToDelete }) => {
  if (tasks.length === 0) {
    return (
      <Card>
        <CardContent className="py-10">
          <div className="text-center text-muted-foreground">
            <p>No tasks found</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="divide-y">
          {tasks.map((task) => (
            <div key={task.id} className="p-4 hover:bg-slate-50 cursor-pointer transition-colors">
              <div className="flex justify-between items-start">
                <div className="flex-1" onClick={() => onTaskClick(task)}>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium">{task.title}</h3>
                    {getStatusBadge(task.status)}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{task.description}</p>
                  <div className="text-xs text-muted-foreground">
                    Created {format(new Date(task.createdAt), 'MMM d, yyyy')}
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onTaskClick(task)}>
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTaskToDelete(task.id)} className="text-red-500">
                      Delete Task
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default Dashboard;
