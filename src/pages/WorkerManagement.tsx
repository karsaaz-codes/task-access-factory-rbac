
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTask, Task } from '@/contexts/TaskContext';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import TaskForm from '@/components/TaskForm';
import TaskDetail from '@/components/TaskDetail';
import { User, PlusCircle, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

const WorkerManagement = () => {
  const { tasks } = useTask();
  const { hasPermission } = useAuth();
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [isTaskDetailOpen, setIsTaskDetailOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  // Check if user has management permissions
  if (!hasPermission('view_all_tasks')) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h1>
            <p className="text-gray-600">You don't have permission to view this page.</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // User data from tasks
  const worker1 = {
    id: '1',
    name: 'John Worker',
    email: 'worker1@factory.com',
    role: 'worker',
  };

  const worker2 = {
    id: '2',
    name: 'Jane Worker',
    email: 'worker2@factory.com',
    role: 'worker',
  };

  const workers = [worker1, worker2];

  const getWorkerTasks = (workerId: string) => {
    return tasks.filter(task => task.assignedTo === workerId);
  };

  const getPendingTaskCount = (workerId: string) => {
    return tasks.filter(task => task.assignedTo === workerId && task.status === 'pending').length;
  };

  const getInProgressTaskCount = (workerId: string) => {
    return tasks.filter(task => task.assignedTo === workerId && task.status === 'in-progress').length;
  };

  const getCompletedTaskCount = (workerId: string) => {
    return tasks.filter(task => task.assignedTo === workerId && task.status === 'completed').length;
  };

  const handleOpenTaskDetail = (task: Task) => {
    setSelectedTask(task);
    setIsTaskDetailOpen(true);
  };

  const handleCreateTaskForWorker = (workerId: string) => {
    setSelectedUserId(workerId);
    setIsTaskFormOpen(true);
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
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Worker Management</h1>
            <p className="text-muted-foreground">Manage tasks for all workers</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {workers.map(worker => (
            <Card key={worker.id} className="overflow-hidden">
              <CardHeader className="bg-slate-50 pb-3">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg flex items-center">
                    <User className="h-5 w-5 mr-2 text-factory-blue" />
                    <span>{worker.name}</span>
                  </CardTitle>
                  <Button 
                    size="sm" 
                    className="bg-factory-blue hover:bg-factory-blue/90"
                    onClick={() => handleCreateTaskForWorker(worker.id)}
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Assign Task
                  </Button>
                </div>
                <div className="text-sm text-muted-foreground mt-1">{worker.email}</div>
                
                <div className="flex flex-wrap gap-2 mt-3">
                  <div className="flex items-center gap-1 text-sm">
                    <Clock className="h-4 w-4 text-amber-500" />
                    <span>Pending: {getPendingTaskCount(worker.id)}</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <AlertCircle className="h-4 w-4 text-blue-500" />
                    <span>In Progress: {getInProgressTaskCount(worker.id)}</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Completed: {getCompletedTaskCount(worker.id)}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="max-h-64">
                  <div className="divide-y">
                    {getWorkerTasks(worker.id).length > 0 ? (
                      getWorkerTasks(worker.id).map(task => (
                        <div
                          key={task.id}
                          className="p-4 hover:bg-slate-50 cursor-pointer transition-colors"
                          onClick={() => handleOpenTaskDetail(task)}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium">{task.title}</h3>
                            {getStatusBadge(task.status)}
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                            {task.description}
                          </p>
                          <div className="text-xs text-muted-foreground">
                            Created {format(new Date(task.createdAt), 'MMM d, yyyy')}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-6 text-center text-muted-foreground">
                        <p>No tasks assigned to this worker</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Task Form Dialog */}
      <Dialog open={isTaskFormOpen} onOpenChange={setIsTaskFormOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Assign New Task</DialogTitle>
          </DialogHeader>
          <TaskForm 
            onClose={() => setIsTaskFormOpen(false)} 
            defaultAssignedTo={selectedUserId || undefined} 
          />
        </DialogContent>
      </Dialog>

      {/* Task Detail Dialog */}
      <Dialog open={isTaskDetailOpen} onOpenChange={setIsTaskDetailOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Task Details</DialogTitle>
          </DialogHeader>
          {selectedTask && <TaskDetail task={selectedTask} onClose={() => setIsTaskDetailOpen(false)} />}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default WorkerManagement;
