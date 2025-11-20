'use client';

import { useState, useEffect } from 'react';
import { format, addDays, parseISO } from 'date-fns';

interface Associate {
  id: string;
  name: string;
  email: string;
  department: string;
}

interface WorkTask {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimatedHours: number;
}

interface ScheduledWork {
  id: string;
  taskId: string;
  associateId: string;
  scheduledDate: string;
  scheduledTime: string;
  status: 'pending' | 'sent' | 'completed';
  recurring?: {
    enabled: boolean;
    frequency: 'daily' | 'weekly' | 'monthly';
  };
}

export default function Home() {
  const [associates, setAssociates] = useState<Associate[]>([
    { id: '1', name: 'John Smith', email: 'john@company.com', department: 'Engineering' },
    { id: '2', name: 'Sarah Johnson', email: 'sarah@company.com', department: 'Design' },
    { id: '3', name: 'Mike Williams', email: 'mike@company.com', department: 'Engineering' },
    { id: '4', name: 'Emily Brown', email: 'emily@company.com', department: 'Marketing' },
  ]);

  const [tasks, setTasks] = useState<WorkTask[]>([
    { id: '1', title: 'Code Review', description: 'Review PR #234', priority: 'high', estimatedHours: 2 },
    { id: '2', title: 'UI Design', description: 'Design new dashboard', priority: 'medium', estimatedHours: 4 },
    { id: '3', title: 'Bug Fix', description: 'Fix login issue', priority: 'urgent', estimatedHours: 3 },
    { id: '4', title: 'Documentation', description: 'Update API docs', priority: 'low', estimatedHours: 1 },
  ]);

  const [scheduledWork, setScheduledWork] = useState<ScheduledWork[]>([]);
  const [activeTab, setActiveTab] = useState<'schedule' | 'associates' | 'tasks' | 'history'>('schedule');

  // New schedule form state
  const [newSchedule, setNewSchedule] = useState({
    taskId: '',
    associateId: '',
    scheduledDate: format(new Date(), 'yyyy-MM-dd'),
    scheduledTime: '09:00',
    recurring: false,
    frequency: 'daily' as 'daily' | 'weekly' | 'monthly',
  });

  // New associate form state
  const [newAssociate, setNewAssociate] = useState({
    name: '',
    email: '',
    department: '',
  });

  // New task form state
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    estimatedHours: 1,
  });

  // Simulate automated scheduling
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const currentDate = format(now, 'yyyy-MM-dd');
      const currentTime = format(now, 'HH:mm');

      setScheduledWork(prev => prev.map(work => {
        if (work.status === 'pending' && work.scheduledDate <= currentDate) {
          const scheduledDateTime = new Date(`${work.scheduledDate}T${work.scheduledTime}`);
          if (now >= scheduledDateTime) {
            // Simulate sending
            console.log(`Sending work to associate: ${work.associateId}`);
            return { ...work, status: 'sent' as const };
          }
        }
        return work;
      }));
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const handleScheduleWork = () => {
    if (!newSchedule.taskId || !newSchedule.associateId) {
      alert('Please select both a task and an associate');
      return;
    }

    const scheduled: ScheduledWork = {
      id: Date.now().toString(),
      taskId: newSchedule.taskId,
      associateId: newSchedule.associateId,
      scheduledDate: newSchedule.scheduledDate,
      scheduledTime: newSchedule.scheduledTime,
      status: 'pending',
      recurring: newSchedule.recurring ? {
        enabled: true,
        frequency: newSchedule.frequency,
      } : undefined,
    };

    setScheduledWork([...scheduledWork, scheduled]);

    // Reset form
    setNewSchedule({
      taskId: '',
      associateId: '',
      scheduledDate: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
      scheduledTime: '09:00',
      recurring: false,
      frequency: 'daily',
    });
  };

  const handleAddAssociate = () => {
    if (!newAssociate.name || !newAssociate.email) {
      alert('Please fill in name and email');
      return;
    }

    const associate: Associate = {
      id: Date.now().toString(),
      ...newAssociate,
    };

    setAssociates([...associates, associate]);
    setNewAssociate({ name: '', email: '', department: '' });
  };

  const handleAddTask = () => {
    if (!newTask.title) {
      alert('Please provide a task title');
      return;
    }

    const task: WorkTask = {
      id: Date.now().toString(),
      ...newTask,
    };

    setTasks([...tasks, task]);
    setNewTask({ title: '', description: '', priority: 'medium', estimatedHours: 1 });
  };

  const getTaskById = (id: string) => tasks.find(t => t.id === id);
  const getAssociateById = (id: string) => associates.find(a => a.id === id);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'text-green-600 bg-green-50';
      case 'completed': return 'text-blue-600 bg-blue-50';
      case 'pending': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">📅 Automated Work Scheduler</h1>
          <p className="text-gray-600">Schedule and automatically send work assignments to your associates</p>
        </header>

        {/* Tab Navigation */}
        <div className="flex space-x-2 mb-6 border-b border-gray-300">
          {(['schedule', 'associates', 'tasks', 'history'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-medium capitalize transition-colors ${
                activeTab === tab
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Schedule Tab */}
        {activeTab === 'schedule' && (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-4 text-gray-800">📋 Create Schedule</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Task</label>
                  <select
                    value={newSchedule.taskId}
                    onChange={(e) => setNewSchedule({ ...newSchedule, taskId: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Choose a task...</option>
                    {tasks.map(task => (
                      <option key={task.id} value={task.id}>
                        {task.title} ({task.priority}) - {task.estimatedHours}h
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Assign to Associate</label>
                  <select
                    value={newSchedule.associateId}
                    onChange={(e) => setNewSchedule({ ...newSchedule, associateId: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Choose an associate...</option>
                    {associates.map(associate => (
                      <option key={associate.id} value={associate.id}>
                        {associate.name} - {associate.department}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                    <input
                      type="date"
                      value={newSchedule.scheduledDate}
                      onChange={(e) => setNewSchedule({ ...newSchedule, scheduledDate: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                    <input
                      type="time"
                      value={newSchedule.scheduledTime}
                      onChange={(e) => setNewSchedule({ ...newSchedule, scheduledTime: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={newSchedule.recurring}
                      onChange={(e) => setNewSchedule({ ...newSchedule, recurring: e.target.checked })}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Recurring</span>
                  </label>

                  {newSchedule.recurring && (
                    <select
                      value={newSchedule.frequency}
                      onChange={(e) => setNewSchedule({ ...newSchedule, frequency: e.target.value as any })}
                      className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  )}
                </div>

                <button
                  onClick={handleScheduleWork}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Schedule Work Assignment
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-4 text-gray-800">⏰ Upcoming Schedules</h2>
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {scheduledWork.filter(w => w.status === 'pending').length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No upcoming schedules</p>
                ) : (
                  scheduledWork
                    .filter(w => w.status === 'pending')
                    .sort((a, b) => {
                      const dateA = new Date(`${a.scheduledDate}T${a.scheduledTime}`);
                      const dateB = new Date(`${b.scheduledDate}T${b.scheduledTime}`);
                      return dateA.getTime() - dateB.getTime();
                    })
                    .map(work => {
                      const task = getTaskById(work.taskId);
                      const associate = getAssociateById(work.associateId);
                      return (
                        <div key={work.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold text-gray-800">{task?.title}</h3>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(task?.priority || 'low')}`}>
                              {task?.priority}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{task?.description}</p>
                          <div className="text-sm text-gray-700">
                            <p>👤 <strong>{associate?.name}</strong> ({associate?.email})</p>
                            <p>📅 {format(parseISO(work.scheduledDate), 'MMM dd, yyyy')} at {work.scheduledTime}</p>
                            {work.recurring && (
                              <p className="text-blue-600">🔄 Recurring: {work.recurring.frequency}</p>
                            )}
                          </div>
                        </div>
                      );
                    })
                )}
              </div>
            </div>
          </div>
        )}

        {/* Associates Tab */}
        {activeTab === 'associates' && (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-4 text-gray-800">➕ Add New Associate</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                  <input
                    type="text"
                    value={newAssociate.name}
                    onChange={(e) => setNewAssociate({ ...newAssociate, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={newAssociate.email}
                    onChange={(e) => setNewAssociate({ ...newAssociate, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="john@company.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                  <input
                    type="text"
                    value={newAssociate.department}
                    onChange={(e) => setNewAssociate({ ...newAssociate, department: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Engineering"
                  />
                </div>
                <button
                  onClick={handleAddAssociate}
                  className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
                >
                  Add Associate
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-4 text-gray-800">👥 All Associates</h2>
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {associates.map(associate => (
                  <div key={associate.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <h3 className="font-semibold text-gray-800">{associate.name}</h3>
                    <p className="text-sm text-gray-600">📧 {associate.email}</p>
                    <p className="text-sm text-gray-600">🏢 {associate.department}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tasks Tab */}
        {activeTab === 'tasks' && (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-4 text-gray-800">➕ Add New Task</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                  <input
                    type="text"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Code Review"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="Review PR #234"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Hours</label>
                  <input
                    type="number"
                    min="0.5"
                    step="0.5"
                    value={newTask.estimatedHours}
                    onChange={(e) => setNewTask({ ...newTask, estimatedHours: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <button
                  onClick={handleAddTask}
                  className="w-full bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors"
                >
                  Add Task
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-4 text-gray-800">📝 All Tasks</h2>
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {tasks.map(task => (
                  <div key={task.id} className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${getPriorityColor(task.priority)}`}>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold">{task.title}</h3>
                      <span className="px-2 py-1 rounded text-xs font-medium bg-white">
                        {task.priority}
                      </span>
                    </div>
                    <p className="text-sm mb-2">{task.description}</p>
                    <p className="text-sm">⏱️ Estimated: {task.estimatedHours}h</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">📜 Work History</h2>
            <div className="space-y-3">
              {scheduledWork.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No work history yet</p>
              ) : (
                scheduledWork
                  .sort((a, b) => {
                    const dateA = new Date(`${a.scheduledDate}T${a.scheduledTime}`);
                    const dateB = new Date(`${b.scheduledDate}T${b.scheduledTime}`);
                    return dateB.getTime() - dateA.getTime();
                  })
                  .map(work => {
                    const task = getTaskById(work.taskId);
                    const associate = getAssociateById(work.associateId);
                    return (
                      <div key={work.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-gray-800">{task?.title}</h3>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(task?.priority || 'low')}`}>
                              {task?.priority}
                            </span>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(work.status)}`}>
                              {work.status}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{task?.description}</p>
                        <div className="text-sm text-gray-700">
                          <p>👤 {associate?.name} ({associate?.email})</p>
                          <p>📅 Scheduled: {format(parseISO(work.scheduledDate), 'MMM dd, yyyy')} at {work.scheduledTime}</p>
                          {work.recurring && (
                            <p className="text-blue-600">🔄 Recurring: {work.recurring.frequency}</p>
                          )}
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
          </div>
        )}

        {/* Stats Footer */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-600 text-sm">Total Associates</p>
            <p className="text-3xl font-bold text-blue-600">{associates.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-600 text-sm">Total Tasks</p>
            <p className="text-3xl font-bold text-purple-600">{tasks.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-600 text-sm">Pending Schedules</p>
            <p className="text-3xl font-bold text-yellow-600">
              {scheduledWork.filter(w => w.status === 'pending').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-600 text-sm">Sent Today</p>
            <p className="text-3xl font-bold text-green-600">
              {scheduledWork.filter(w => w.status === 'sent' && w.scheduledDate === format(new Date(), 'yyyy-MM-dd')).length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
