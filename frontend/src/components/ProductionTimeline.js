import React from 'react';
import { CheckCircle2, Plus, Sparkles, Clock, Target, ArrowRight, Calendar } from 'lucide-react';

const ProductionTimeline = ({ milestones, tasks, onToggleTask, onSwitchToTasks }) => {
  // Colors matching your app design
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

  // Calculate overall project progress
  const calculateProgress = () => {
    if (tasks.length === 0) return 0;
    const completedTasks = tasks.filter(task => task.completed).length;
    return Math.round((completedTasks / tasks.length) * 100);
  };

  // Calculate milestone progress
  const getMilestoneProgress = (milestone) => {
    const milestoneTasks = tasks.filter(task => task.milestone === milestone.name);
    if (milestoneTasks.length === 0) return 0;
    const completedTasks = milestoneTasks.filter(task => task.completed);
    return Math.round((completedTasks.length / milestoneTasks.length) * 100);
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return "TBD";
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(date).toLocaleDateString(undefined, options);
  };

  const overallProgress = calculateProgress();

  return (
    <div className="w-full space-y-8">
      {/* Enhanced Main Timeline Header */}
      <div className="relative">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl shadow-2xl border border-gray-700">
            <Clock className="h-5 w-5 text-pink-400" />
            <span className="text-2xl font-bold text-white">{overallProgress}%</span>
            <span className="text-gray-400">Project Complete</span>
            <div className="h-6 w-px bg-gray-600 mx-2"></div>
            <span className="text-sm text-gray-400">
              {tasks.filter(t => t.completed).length} of {tasks.length} tasks done
            </span>
          </div>
        </div>

        {/* Enhanced Timeline Bar */}
        <div className="relative">
          {/* Background track */}
          <div className="h-4 bg-gradient-to-r from-gray-800 to-gray-700 rounded-full shadow-inner border border-gray-600 overflow-hidden">
            {/* Progress fill with animated gradient */}
            <div 
              className="h-full bg-gradient-to-r from-pink-500 via-purple-500 to-pink-600 rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
              style={{ width: `${overallProgress}%` }}
            >
              {/* Animated shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] animate-[shine_2s_ease-in-out_infinite]"></div>
            </div>
          </div>

          {/* Milestone markers */}
          <div className="absolute top-0 left-0 w-full h-4 flex items-center">
            {milestones.sort((a, b) => a.order - b.order).map((milestone, index) => {
              const position = ((index + 1) / milestones.length) * 100;
              const progress = getMilestoneProgress(milestone);
              
              return (
                <div
                  key={milestone.id}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 top-1/2"
                  style={{ left: `${position}%` }}
                >
                  {/* Milestone dot */}
                  <div className={`
                    w-6 h-6 rounded-full border-4 transition-all duration-300 cursor-pointer
                    ${milestone.active 
                      ? 'bg-pink-500 border-pink-300 shadow-lg shadow-pink-500/50 animate-pulse' 
                      : progress === 100
                        ? 'bg-green-500 border-green-300 shadow-lg shadow-green-500/50'
                        : 'bg-gray-600 border-gray-400 hover:border-gray-300'
                    }
                  `}>
                    {progress === 100 && (
                      <CheckCircle2 className="w-4 h-4 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                    )}
                    {milestone.active && (
                      <Sparkles className="w-3 h-3 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Milestone labels */}
        <div className="flex justify-between mt-4 px-3">
          {milestones.sort((a, b) => a.order - b.order).map((milestone) => (
            <div key={milestone.id} className="text-center">
              <div className={`text-sm font-medium ${milestone.active ? 'text-pink-400' : 'text-gray-400'}`}>
                {milestone.name}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {getMilestoneProgress(milestone)}% complete
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Enhanced Milestone Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {milestones.sort((a, b) => a.order - b.order).map(milestone => {
          const milestoneTasks = tasks.filter(task => task.milestone === milestone.name);
          const completedTasks = milestoneTasks.filter(task => task.completed);
          const progressPercent = milestoneTasks.length > 0 ? Math.round((completedTasks.length / milestoneTasks.length) * 100) : 0;
          const isCompleted = progressPercent === 100;
          
          return (
            <div 
              key={milestone.id}
              className={`
                relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl overflow-hidden transition-all duration-300 shadow-xl border
                ${milestone.active 
                  ? 'border-pink-500/50 shadow-pink-500/20 ring-1 ring-pink-500/30' 
                  : isCompleted
                    ? 'border-green-500/50 shadow-green-500/20'
                    : 'border-gray-700 hover:border-gray-600'
                }
              `}
            >
              {/* Glow effect for active milestone */}
              {milestone.active && (
                <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-purple-500/10 pointer-events-none"></div>
              )}

              {/* Header */}
              <div className={`
                p-6 border-b border-gray-700/50 relative
                ${milestone.active 
                  ? 'bg-gradient-to-r from-pink-900/30 to-purple-900/20' 
                  : isCompleted
                    ? 'bg-gradient-to-r from-green-900/30 to-green-800/20'
                    : 'bg-gray-800/30'
                }
              `}>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {milestone.active && (
                        <div className="w-3 h-3 bg-pink-500 rounded-full animate-pulse shadow-lg shadow-pink-500/50"></div>
                      )}
                      {isCompleted && !milestone.active && (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      )}
                      <h3 className="text-xl font-bold text-white">{milestone.name}</h3>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <div className="flex items-center gap-1">
                        <Target className="w-4 h-4" />
                        <span>{completedTasks.length}/{milestoneTasks.length} tasks</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(milestone.targetDate)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    className={`
                      p-3 rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:scale-105
                      ${milestone.active 
                        ? 'bg-gradient-to-r from-pink-600 to-pink-700 hover:from-pink-500 hover:to-pink-600' 
                        : 'bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600'
                      }
                    `}
                    onClick={() => onSwitchToTasks && onSwitchToTasks()}
                  >
                    <Plus className="h-5 w-5 text-white" />
                  </button>
                </div>
                
                {/* Enhanced Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-300">Progress</span>
                    <span className={`text-sm font-bold ${progressPercent === 100 ? 'text-green-400' : 'text-pink-400'}`}>
                      {progressPercent}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 h-3 rounded-full overflow-hidden shadow-inner">
                    <div
                      className={`
                        h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden
                        ${isCompleted 
                          ? 'bg-gradient-to-r from-green-400 to-green-600' 
                          : milestone.active
                            ? 'bg-gradient-to-r from-pink-500 to-purple-600'
                            : 'bg-gradient-to-r from-gray-500 to-gray-600'
                        }
                      `}
                      style={{ width: `${progressPercent}%` }}
                    >
                      {/* Animated shine effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] animate-[shine_3s_ease-in-out_infinite]"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tasks Preview */}
              <div className="p-4">
                <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                  {milestoneTasks.slice(0, 4).map(task => (
                    <div 
                      key={task.id}
                      className={`
                        flex items-center p-3 rounded-lg transition-all group cursor-pointer
                        ${task.completed 
                          ? 'bg-gray-800/50 hover:bg-gray-700/50' 
                          : 'bg-gray-800/80 hover:bg-gray-700/80'
                        }
                      `}
                      onClick={() => onToggleTask && onToggleTask(task.id)}
                    >
                      <div className="mr-3 flex-shrink-0">
                        {task.completed ? (
                          <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center shadow-lg">
                            <CheckCircle2 className="h-3 w-3 text-white" />
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-full border-2 border-gray-500 group-hover:border-pink-400 transition-all"></div>
                        )}
                      </div>
                      <div className={`flex-1 ${task.completed ? 'text-gray-400 line-through' : 'text-white'}`}>
                        <div className="text-sm font-medium">{task.name}</div>
                        {task.category && (
                          <div className={`text-xs ${task.completed ? 'text-gray-500' : 'text-gray-400'}`}>
                            {task.category}
                          </div>
                        )}
                      </div>
                      <ArrowRight className="h-4 w-4 text-gray-500 opacity-0 group-hover:opacity-100 transition-all" />
                    </div>
                  ))}
                  
                  {milestoneTasks.length === 0 && (
                    <div className="text-center py-8 px-4">
                      <div className="text-gray-500 mb-2">No tasks yet</div>
                      <div className="text-xs text-gray-600">Ready to get started!</div>
                    </div>
                  )}
                  
                  {milestoneTasks.length > 4 && (
                    <button
                      onClick={() => onSwitchToTasks && onSwitchToTasks()}
                      className="w-full py-3 mt-2 text-center text-gray-400 hover:text-white rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-all text-sm border border-gray-700 hover:border-gray-600"
                    >
                      View {milestoneTasks.length - 4} more tasks
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add custom keyframes for animations */}
      <style jsx>{`
        @keyframes shine {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #ff3d7f, #00dbdd);
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #ff9db8, #00dbdd);
        }
      `}</style>
    </div>
  );
};

export default ProductionTimeline;