import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Plus, Search, Check, Edit, Trash2, ChevronRight, Clock, AlertCircle, Target, UploadCloud } from 'lucide-react';

const TasksPage = ({ tasks, milestones, onAddTask, onUpdateTask, onDeleteTask, onBulkAddTasks }) => { // Ensure onBulkAddTasks is destructured here
  const [searchTerm, setSearchTerm] = useState('');
  const [editingTask, setEditingTask] = useState(null);
  const [newTask, setNewTask] = useState({ name: '', milestone: 'Pre-Production' });
  const [showAddTaskFormForMilestone, setShowAddTaskFormForMilestone] = useState({});
  const [sortBy, setSortBy] = useState({ field: 'name', direction: 'asc' });
  const [showBulkAddModal, setShowBulkAddModal] = useState(false); // New state for bulk add modal
  const [bulkTaskInput, setBulkTaskInput] = useState(''); // New state for bulk input text
  const [bulkAddMilestone, setBulkAddMilestone] = useState('Pre-Production'); // Milestone for bulk added tasks

  // Ref for scrolling to next task
  const nextTaskRef = useRef(null);

  const colors = {
    primary: '#ff3d7f',
    primaryLight: '#ff9db8',
    secondary: '#121212',
    secondaryLight: '#212121',
    accent: '#00dbdd',
    successGreen: '#4ADE80',
    warningOrange: '#dc6300',
    errorRed: '#FF3D3D'
  };

  // Get the active milestone (should be Pre-Production)
  const activeMilestone = milestones.find(m => m.active) || milestones.find(m => m.name === 'Pre-Production') || milestones[0];
  
  // Get next uncompleted task for active milestone
  const nextTask = useMemo(() => {
    const milestoneTasks = tasks.filter(task => 
      task.milestone === activeMilestone.name && !task.completed
    );
    return milestoneTasks[0] || null;
  }, [tasks, activeMilestone]);

  // Auto-scroll to next task when it changes
  useEffect(() => {
    if (nextTaskRef.current && nextTask) {
      nextTaskRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [nextTask]);

  // Handle task form submission
  const handleSubmitNewTask = (e) => {
    e.preventDefault();
    if (newTask.name.trim()) {
      onAddTask({
        ...newTask,
        completed: false,
        progress: 0
      });
      setNewTask({ name: '', milestone: 'Pre-Production' });
      setShowAddTaskFormForMilestone({});
    }
  };

  const handleAddTaskToMilestone = (milestoneName) => {
    setNewTask({ ...newTask, milestone: milestoneName });
    setShowAddTaskFormForMilestone({ [milestoneName]: true });
  };

  const handleNewTaskInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewTask(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle edit form submission
  const handleEditSubmit = (e) => {
    e.preventDefault();
    onUpdateTask(editingTask.id, editingTask);
    setEditingTask(null);
  };

  // Handle bulk task addition
  const handleBulkAddTasks = (e) => {
    e.preventDefault();
    if (!bulkTaskInput.trim()) return;

    const lines = bulkTaskInput.split('\n');
    const tasksToAdd = []; // Collect all tasks here

    lines.forEach(line => {
      const trimmedLine = line.trim();
      if (trimmedLine) {
        let taskName = trimmedLine;
        let completed = false;

        // Check for "[x]" prefix for completed tasks
        if (taskName.startsWith('[x] ')) {
          taskName = taskName.substring(4).trim();
          completed = true;
        } else if (taskName.startsWith('[ ] ')) {
          taskName = taskName.substring(4).trim();
          completed = false;
        }

        // Now, check for bullet point prefix if not already handled by [x]/[ ]
        if (taskName.startsWith('- ')) {
          taskName = taskName.substring(2).trim();
        }

        if (taskName) { // Ensure task name is not empty after stripping prefix
          tasksToAdd.push({
            name: taskName,
            milestone: bulkAddMilestone,
            completed: completed,
            progress: completed ? 100 : 0 // Set progress to 100 if completed
          });
        }
      }
    });

    // Call the new prop to add all tasks at once
    if (tasksToAdd.length > 0) {
      onBulkAddTasks(tasksToAdd); // Pass the array of tasks
    }

    // Reset and close modal
    setBulkTaskInput('');
    setShowBulkAddModal(false);
  };

  // Filter tasks by search term
  const searchedTasks = tasks.filter(task => {
    const taskName = task.name || '';
    return taskName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="rounded-lg p-4" style={{ backgroundColor: colors.secondary }}>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-white mb-2">Tasks</h2>
          <p className="text-gray-400">Manage and track production tasks across milestones</p>
        </div>
        {/* Bulk Add Button */}
        <button
          className="px-4 py-2 rounded-lg text-white shadow-md hover:shadow-lg transition-all bg-gradient-to-r from-cyan-500 to-cyan-600 flex items-center gap-2"
          onClick={() => setShowBulkAddModal(true)}
        >
          <UploadCloud className="h-4 w-4" />
          Bulk Add Tasks
        </button>
      </div>

      {/* Search Filter */}
      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search tasks..."
          className="bg-gray-800 text-white pl-10 pr-4 py-2 rounded w-full border border-gray-700 focus:ring-2 focus:ring-pink-500 focus:outline-none"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Next Task Highlight Section */}
      {nextTask && (
        <div className="mb-8 bg-gradient-to-r from-pink-900/30 to-purple-900/30 rounded-lg p-6 border border-pink-500/30">
          <div className="flex items-center gap-3 mb-4">
            <Target className="h-6 w-6 text-pink-400" />
            <h3 className="text-lg font-bold text-white">Next Priority Task</h3>
            <div className="px-3 py-1 bg-pink-600/20 rounded-full text-sm text-pink-300">
              {activeMilestone.name}
            </div>
          </div>
          
          <div 
            className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg hover:bg-gray-700/50 transition-all group"
          >
            <div className="flex items-center gap-4">
              <div 
                className="w-8 h-8 rounded-full border-2 border-pink-500 flex items-center justify-center group-hover:bg-pink-500/20 transition-all cursor-pointer"
                onClick={() => onUpdateTask(nextTask.id, { ...nextTask, completed: !nextTask.completed })}
              >
                <div className="w-3 h-3 rounded-full bg-pink-500 opacity-0 group-hover:opacity-100 transition-all"></div>
              </div>
              <div>
                <h4 className="text-white font-medium text-lg">{nextTask.name}</h4>
                {nextTask.category && (
                  <p className="text-gray-400 text-sm">{nextTask.category}</p>
                )}
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </div>
        </div>
      )}

      {/* Milestone Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {milestones.map(milestone => {
          const milestoneTasks = searchedTasks.filter(task => task.milestone === milestone.name);
          const completedTasks = milestoneTasks.filter(task => task.completed);
          const incompleteTasks = milestoneTasks.filter(task => !task.completed);
          const progressPercent = milestoneTasks.length > 0 ? Math.round((completedTasks.length / milestoneTasks.length) * 100) : 0;

          return (
            <div 
              key={milestone.id} 
              className={`rounded-lg overflow-hidden transition-all ${
                milestone.active ? 'ring-2 ring-pink-500/50 bg-gray-900' : 'bg-gray-900'
              }`}
            >
              {/* Milestone Header */}
              <div className={`p-4 border-b border-gray-700 ${
                milestone.active 
                  ? 'bg-gradient-to-r from-pink-900/40 to-pink-800/20' 
                  : 'bg-gray-800/50'
              }`}>
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      {milestone.active && <div className="w-2 h-2 rounded-full bg-pink-500 animate-pulse"></div>}
                      {milestone.name}
                    </h3>
                    <div className="text-sm text-gray-400 mt-1">
                      {completedTasks.length}/{milestoneTasks.length} tasks complete
                    </div>
                  </div>
                  <button
                    className="p-2 rounded-full bg-pink-600/80 hover:bg-pink-700 transition-all shadow-lg"
                    onClick={() => handleAddTaskToMilestone(milestone.name)}
                  >
                    <Plus className="h-4 w-4 text-white" />
                  </button>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{
                      width: `${progressPercent}%`,
                      background: milestone.active 
                        ? 'linear-gradient(to right, #EC4899, #be185d)'
                        : 'linear-gradient(to right, #4ADE80, #22c55e)'
                    }}
                  ></div>
                </div>
                <div className="text-right text-sm text-gray-400 mt-1">{progressPercent}%</div>
              </div>

              {/* Add Task Form */}
              {showAddTaskFormForMilestone[milestone.name] && (
                <div className="p-4 bg-gray-800/30 border-b border-gray-700">
                  <form onSubmit={handleSubmitNewTask} className="space-y-3">
                    <input
                      type="text"
                      name="name"
                      value={newTask.name}
                      onChange={handleNewTaskInputChange}
                      placeholder="Task name"
                      className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:ring-2 focus:ring-pink-500 focus:outline-none"
                      required
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded transition-all"
                      >
                        Add Task
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAddTaskFormForMilestone({})
                      }
                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Tasks List with Auto-scroll */}
              <div className="p-4 max-h-96 overflow-y-auto custom-scrollbar">
                <div className="space-y-3">
                  {/* Show all tasks in order, incomplete and complete mixed */}
                  {milestoneTasks
                    .sort((a, b) => a.completed === b.completed ? 0 : a.completed ? 1 : -1)
                    .map(task => (
                    <div 
                      key={task.id}
                      ref={task === nextTask ? nextTaskRef : null}
                      className={`
                        flex items-center p-3 rounded-lg transition-all shadow-md group
                        ${task === nextTask 
                          ? 'bg-pink-900/30 border border-pink-500/50 shadow-pink-500/20' 
                          : task.completed
                            ? 'bg-gray-900/50 hover:bg-gray-800/70 opacity-75'
                            : 'bg-gray-800/80 hover:bg-gray-700/80'
                        }
                      `}
                    >
                      <div 
                        className="mr-3 flex-shrink-0 transition-all cursor-pointer"
                        onClick={() => onUpdateTask(task.id, { ...task, completed: !task.completed })}
                      >
                        {task.completed ? (
                          <div className="h-5 w-5 rounded-full bg-green-500 flex items-center justify-center transition-all shadow-md">
                            <Check className="h-3 w-3 text-white" />
                          </div>
                        ) : (
                          <div className={`
                            h-5 w-5 rounded-full border-2 transition-all flex items-center justify-center
                            ${task === nextTask 
                              ? 'border-pink-500 bg-pink-500/20' 
                              : 'border-gray-500 hover:border-white group-hover:border-cyan-500'
                            }
                          `}>
                            {task === nextTask && (
                              <div className="w-2 h-2 rounded-full bg-pink-500 animate-pulse"></div>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-grow">
                        <div className={`font-medium ${task.completed ? 'text-gray-400 line-through' : 'text-white'}`}>
                          {task.name}
                        </div>
                        {task.category && (
                          <div className={`text-sm ${task.completed ? 'text-gray-500' : 'text-gray-400'}`}>
                            {task.category}
                          </div>
                        )}
                        {task === nextTask && !task.completed && (
                          <div className="text-xs text-pink-300 mt-1 flex items-center gap-1">
                            <Target className="h-3 w-3" />
                            Next priority task
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                        <button 
                          className="p-1 rounded-full hover:bg-gray-600 transition-all"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingTask(task);
                          }}
                        >
                          <Edit className="h-3 w-3 text-gray-400 hover:text-white" />
                        </button>
                        <button 
                          className="p-1 rounded-full hover:bg-gray-600 transition-all"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteTask(task.id);
                          }}
                        >
                          <Trash2 className="h-3 w-3 text-gray-400 hover:text-red-400" />
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {milestoneTasks.length === 0 && (
                    <div className="text-center text-gray-500 py-6 px-4 bg-gray-800/40 rounded-lg">
                      <AlertCircle className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                      <div className="text-sm">No tasks for this milestone yet</div>
                      <div className="text-xs text-gray-600 mt-1">Click + to add your first task</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Task Modal */}
      {editingTask && (
        <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-lg p-6 max-w-md w-full shadow-2xl border border-gray-800">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-white">Edit Task</h3>
              <button 
                className="text-gray-400 hover:text-white transition-all"
                onClick={() => setEditingTask(null)}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-400 mb-1">Task Name</label>
                <input
                  type="text"
                  value={editingTask.name}
                  onChange={(e) => setEditingTask({...editingTask, name: e.target.value})}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:ring-2 focus:ring-pink-500 focus:outline-none"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-400 mb-1">Category</label>
                <input
                  type="text"
                  value={editingTask.category || ''}
                  onChange={(e) => setEditingTask({...editingTask, category: e.target.value})}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:ring-2 focus:ring-pink-500 focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-gray-400 mb-1">Milestone</label>
                <select
                  value={editingTask.milestone}
                  onChange={(e) => setEditingTask({...editingTask, milestone: e.target.value})}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:ring-2 focus:ring-pink-500 focus:outline-none"
                >
                  {milestones.map(milestone => (
                    <option key={milestone.id} value={milestone.name}>
                      {milestone.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex justify-end gap-3 pt-4">
                <button 
                  type="button"
                  className="px-4 py-2 rounded-lg border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 transition-all"
                  onClick={() => setEditingTask(null)}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 rounded-lg text-white shadow-md hover:shadow-lg transition-all bg-gradient-to-r from-pink-500 to-pink-600"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Add Tasks Modal */}
      {showBulkAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-lg p-6 max-w-lg w-full shadow-2xl border border-gray-800">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-white">Bulk Add Tasks</h3>
              <button 
                className="text-gray-400 hover:text-white transition-all"
                onClick={() => setShowBulkAddModal(false)}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleBulkAddTasks} className="space-y-4">
              <div>
                <label className="block text-gray-400 mb-1">Paste your list of tasks (one per line). Use `[x] ` for completed tasks, or `- ` for bulleted tasks.</label>
                <textarea
                  value={bulkTaskInput}
                  onChange={(e) => setBulkTaskInput(e.target.value)}
                  placeholder="e.g.
[x] Completed task example
[ ] Incomplete task example
- Another task to do
Just a plain line task"
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white h-40 resize-y focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                ></textarea>
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Assign to Milestone</label>
                <select
                  value={bulkAddMilestone}
                  onChange={(e) => setBulkAddMilestone(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                >
                  {milestones.map(milestone => (
                    <option key={milestone.id} value={milestone.name}>
                      {milestone.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex justify-end gap-3 pt-4">
                <button 
                  type="button"
                  className="px-4 py-2 rounded-lg border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 transition-all"
                  onClick={() => setShowBulkAddModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 rounded-lg text-white shadow-md hover:shadow-lg transition-all bg-gradient-to-r from-cyan-500 to-cyan-600"
                >
                  Add Tasks
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TasksPage;
