import React, { useState, useEffect, useMemo } from 'react';
import { Camera, Check, Film, Music, Settings, Users, Clock, Edit, XCircle, Calendar, Sparkles, CheckCircle2, ChevronRight, Hourglass, Target } from 'lucide-react';
import { fetchTasks, fetchMilestones, fetchSystemStatus, updateTask, updateMilestone, addTask as apiAddTask, deleteTask as apiDeleteTask, reorderTasks as apiReorderTasks } from './api';
import ShotList from './components/ShotList';
import ProductionTimeline from './components/ProductionTimeline';
import TasksPage from './components/TasksPage';
import ConceptBoard from './components/ConceptBoard';
import AdminSettings from './components/AdminSettings';
import LoreNotes from './components/LoreNotes';

// Updated color scheme based on your preferences
const colors = {
  primary: '#ff3d7f',       // Vibrant pink
  primaryLight: '#ff9db8',  // Lighter pink
  primaryDark: '#9c6172',   // Darker pink
  secondary: '#121212',     // Deeper black
  secondaryLight: '#212121',// Light black
  light: '#ffffff',         // White
  midGray: '#868686',       // Mid gray
  accent: '#00dbdd',        // Teal accent (cyan blue)
  successGreen: '#4ADE80',  // Green for completed items
  warningOrange: '#dc6300', // Orange for warnings
  errorRed: '#FF3D3D'       // Red for errors/delete
};

// Navigation button configuration
const navButtons = [
  { id: 'overview', label: 'Overview' },
  { id: 'timeline', label: 'Timeline' },
  { id: 'tasks', label: 'Tasks' },
  { id: 'shots', label: 'Shots' },
  { id: 'concepts', label: 'Concepts' },
  { id: 'notes', label: 'Notes' },
];

// Custom scrollbar styles and animations
const customScrollbarStyles = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 10px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: linear-gradient(to bottom, ${colors.primary}, ${colors.accent});
    border-radius: 10px;
    border: 2px solid transparent;
    background-clip: content-box;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(to bottom, ${colors.primaryLight}, ${colors.accent});
    background-clip: content-box;
  }
  
  /* Glow animation for active timeline */
  @keyframes glow {
    0% { box-shadow: 0 0 15px currentColor; }
    50% { box-shadow: 0 0 25px currentColor, 0 0 35px currentColor; }
    100% { box-shadow: 0 0 15px currentColor; }
  }
  
  @keyframes shine {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
  
  /* Ensure sticky notes persist */
  .sticky-notes-container {
    /* Add any additional styles needed for sticky notes */
  }
`;

function App() {
  const [activeTab, setActiveTab] = useState('overview');

  // Initialize tasks from localStorage or as empty array
  const [tasks, setTasks] = useState(() => {
    const savedTasks = localStorage.getItem('melodicJustice_tasks');
    return savedTasks ? JSON.parse(savedTasks) : [];
  });
  
  const [milestones, setMilestones] = useState(() => {
    const savedMilestones = localStorage.getItem('melodicJustice_milestones');
    return savedMilestones ? JSON.parse(savedMilestones) : [
      { 
        id: 1, 
        name: 'Pre-Production', 
        completed: false, 
        active: true, // Set Pre-Production as active
        description: 'Character design, storyboarding, and initial setup', 
        targetDate: '2025-12-31',
        order: 1 
      },
      { 
        id: 2, 
        name: 'Production', 
        completed: false, 
        active: false, // Set Production as inactive
        description: 'Animation, modeling, and scene assembly', 
        targetDate: '2026-06-30',
        order: 2 
      },
      { 
        id: 3, 
        name: 'Post-Production', 
        completed: false, 
        active: false, // Set Post-Production as inactive
        description: 'Rendering, effects, music, and final touches', 
        targetDate: '2026-12-31',
        order: 3 
      }
    ];
  });

  const [systemStatus, setSystemStatus] = useState({
    storage: { total: 0, used: 0, percentage: 0 },
    backup: { last_backup: new Date().toISOString(), status: 'OK' },
    render_cache: { total: 0, used: 0, percentage: 0 }
  });

  // And update the fallback date in estimatedFinishDate to match:
  const estimatedFinishDate = useMemo(() => {
    try {
      const lastMilestone = [...milestones].sort((a, b) => b.order - a.order)[0];
      
      if (!lastMilestone || !lastMilestone.targetDate) {
        return new Date('2026-12-31'); // Updated fallback date
      }
      
      const targetDate = new Date(lastMilestone.targetDate);
      
      // Check if the date is valid
      if (isNaN(targetDate.getTime())) {
        return new Date('2026-12-31'); // Updated fallback date
      }
      
      return targetDate;
    } catch (error) {
      console.error("Error calculating finish date:", error);
      return new Date('2026-12-31'); // Updated fallback date
    }
  }, [milestones]);

  // UI state
  const [editingStatCard, setEditingStatCard] = useState(null);
  const [showAdminSettings, setShowAdminSettings] = useState(false);
  const [selectedLoreNote, setSelectedLoreNote] = useState(null);
  const [showLoreModal, setShowLoreModal] = useState(false);
  
  // Piano key sound effect state (kept for potential future use or if user changes mind)
  const [keySound, setKeySound] = useState(null); 
  
  // Initialize lore notes from localStorage or with defaults
  const [loreNotes, setLoreNotes] = useState(() => {
    const savedNotes = localStorage.getItem('melodicJustice_loreNotes');
    return savedNotes ? JSON.parse(savedNotes) : [
      {
        id: 1,
        title: 'Main Character - Alex',
        content: 'A young music producer caught between the underground scene and commercial success. Uses cyberpunk aesthetics to express rebellion against corporate music industry.',
        category: 'Character',
        color: 'pink'
      },
      {
        id: 2,
        title: 'Setting - Neo Tokyo 2087',
        content: 'Neon-lit streets where music battles happen in underground clubs. Corporate towers loom overhead, controlling mainstream media.',
        category: 'World Building',
        color: 'cyan'
      },
      {
        id: 3,
        title: 'Story Theme',
        content: 'Music as a form of justice and resistance. The power of authentic art versus manufactured entertainment.',
        category: 'Theme',
        color: 'purple'
      }
    ];
  });
  const [projectStats, setProjectStats] = useState(() => {
    const savedStats = localStorage.getItem('melodicJustice_projectStats');
    return savedStats ? JSON.parse(savedStats) : {
      scenes: { total: 24, completed: 0, label: 'Scenes Completed', iconType: 'film' },
      characters: { total: 6, completed: 0, label: 'Characters Rigged', iconType: 'users' },
      shots: { total: 300, completed: 0, label: 'Shots Animated', iconType: 'camera' },
      music: { total: 8, completed: 0, label: 'Music Tracks', iconType: 'music' }
    };
  });

  // Priority tasks is a derived state
  const priorityTasks = useMemo(() => {
    // Get tasks for the active milestone
    const activeMilestoneName = milestones.find(m => m.active)?.name || 'Pre-Production';
    const milestoneTasks = tasks.filter(task => task.milestone === activeMilestoneName);
    
    // Sort by priority: show incomplete tasks first, in order they appear (natural order)
    const incompleteTasks = milestoneTasks.filter(task => !task.completed);
    const nextUpTasks = incompleteTasks.slice(0, 5); // Show next 5 tasks to work on
    
    return nextUpTasks;
  }, [tasks, milestones]);

  // Initialize audio for sound effects (not piano keys anymore, but general clicks)
  useEffect(() => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    setKeySound(() => { // Renamed from setKeySound to setClickSound if this was for general clicks
      return () => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.type = 'sine';
        oscillator.frequency.value = 440; // A simple tone
        
        gainNode.gain.value = 0.1;
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1);
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.1);
      };
    });
    
    return () => {
      if (audioContext && audioContext.state !== 'closed') {
        audioContext.close();
      }
    };
  }, []);
  
  const getIcon = (iconType) => {
    switch(iconType) {
      case 'film': return <Film className="w-8 h-8" />;
      case 'users': return <Users className="w-8 h-8" />;
      case 'camera': return <Camera className="w-8 h-8" />;
      case 'music': return <Music className="w-8 h-8" />;
      default: return null;
    }
  };

  // Inject custom scrollbar styles
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.innerHTML = customScrollbarStyles;
    document.head.appendChild(styleElement);
    
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);
  
  useEffect(() => {
    localStorage.setItem('melodicJustice_loreNotes', JSON.stringify(loreNotes));
  }, [loreNotes]);
  
  // Save data to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('melodicJustice_tasks', JSON.stringify(tasks));
  }, [tasks]);
  
  useEffect(() => {
    localStorage.setItem('melodicJustice_milestones', JSON.stringify(milestones));
  }, [milestones]);
  
  useEffect(() => {
    localStorage.setItem('melodicJustice_projectStats', JSON.stringify(projectStats));
  }, [projectStats]);
  
  // Load data from API if available
  useEffect(() => {
    const loadData = async () => {
      try {
        const fetchedTasks = await fetchTasks();
        if (fetchedTasks && fetchedTasks.length > 0) setTasks(fetchedTasks);
        
        const fetchedMilestones = await fetchMilestones();
        if (fetchedMilestones && fetchedMilestones.length > 0) setMilestones(fetchedMilestones);
        
        const status = await fetchSystemStatus();
        if (status) {
          setSystemStatus(status);
        }
      } catch (error) {
        console.error("Error loading data from API, using localStorage instead:", error);
      }
    };
    
    // Try to load from API, but don't worry if it fails - we'll use localStorage
    loadData();
  }, []);

  // Function to check if milestone should advance
  const checkMilestoneAdvancement = (updatedTasks) => {
    const activeMilestone = milestones.find(m => m.active);
    if (!activeMilestone) return;
    
    const milestoneTasks = updatedTasks.filter(task => task.milestone === activeMilestone.name);
    const allTasksComplete = milestoneTasks.length > 0 && milestoneTasks.every(task => task.completed);
    
    if (allTasksComplete) {
      // Find the next milestone to advance to
      const currentIndex = milestones.findIndex(m => m.id === activeMilestone.id);
      const nextIndex = currentIndex + 1;
      
      // If there's a next milestone, make it active
      if (nextIndex < milestones.length) {
        const nextMilestoneId = milestones[nextIndex].id;
        toggleMilestone(nextMilestoneId);
      }
    }
  };
  
  const toggleMilestone = async (id) => {
    try {
      // Try API first
      try {
        await updateMilestone(id);
      } catch (apiError) {
        // API not available, that's okay
      }
      
      // Update local state regardless
      setMilestones(milestones.map(milestone => 
        milestone.id === id ? { ...milestone, active: true } : { ...milestone, active: false }
      ));
    } catch (error) {
      console.error("Failed to update milestone:", error);
    }
  };
  
  // Update task: if called with just an id, toggles completed.
  // If called with (id, updates), merges updates onto the task.
  const updateTaskHandler = async (id, updates) => {
    try {
      const task = tasks.find(t => t.id === id);
      if (!task) return;

      const updatedTask = updates
        ? { ...task, ...updates }
        : { ...task, completed: !task.completed };

      const updatedTasks = tasks.map(t => t.id === id ? updatedTask : t);
      setTasks(updatedTasks);
      checkMilestoneAdvancement(updatedTasks);

      try {
        await updateTask(id, updatedTask);
      } catch (apiError) {
        // Backend down - localStorage still has the update
      }
    } catch (error) {
      console.error("Failed to update task:", error);
    }
  };

  // Bulk delete: removes many tasks at once, fires API calls in parallel
  const bulkDeleteTasks = async (ids) => {
    const idSet = new Set(ids);
    setTasks(prev => prev.filter(task => !idSet.has(task.id)));
    await Promise.allSettled(ids.map(id => apiDeleteTask(id).catch(() => {})));
  };

  // Reorder: applies a new sequence of ids and persists via batch endpoint.
  // updatedTasks is the locally-reordered array; orderedIds is the sequence
  // (may be a subset, e.g. just one milestone's tasks).
  const reorderTasks = async (updatedTasks, orderedIds) => {
    setTasks(updatedTasks);
    try {
      await apiReorderTasks(orderedIds);
    } catch (e) {
      // Backend down - local state still reflects the new order
    }
  };

  // Quick-add trigger: incrementing this tells TasksPage to open the add form
  const [quickAddTick, setQuickAddTick] = useState(0);
  const triggerQuickAddTask = () => {
    setActiveTab('tasks');
    setQuickAddTick(t => t + 1);
  };

  // Global keyboard shortcuts:
  //   N    -> quick add new task (jumps to Tasks tab)
  //   T    -> jump to Tasks tab
  //   /    -> jump to Tasks tab (search will be focused there)
  //   ?    -> jump to Tasks tab (in-page help)
  // Ignored while typing in an input/textarea/contentEditable.
  useEffect(() => {
    const handler = (e) => {
      const target = e.target;
      const inField = target && (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable
      );
      if (inField) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      const key = e.key.toLowerCase();
      if (key === 'n') {
        e.preventDefault();
        triggerQuickAddTask();
      } else if (key === 't') {
        e.preventDefault();
        setActiveTab('tasks');
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Function to handle navigation button click
  const handleNavButtonClick = (buttonId) => {
    setActiveTab(buttonId);
    if (keySound) { // Using keySound for general click sound
      keySound();
    }
  };

  // New function to handle stat card editing
  const updateStatCard = (key, updates) => {
    setProjectStats(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        ...updates
      }
    }));
    setEditingStatCard(null);
  };

  // Add single new task function
  const addTask = async (taskData) => {
    try {
      const tempId = tasks.length > 0 ? Math.max(...tasks.map(t => t.id || 0)) + 1 : 1;
      // Optimistic order = max(order) + 1 so the new task lands at the bottom of
      // its milestone immediately, instead of flashing at the top (order=0) before
      // the server response replaces it.
      const tempOrder = tasks.length > 0 ? Math.max(...tasks.map(t => t.order || 0)) + 1 : 1;
      const optimisticTask = {
        ...taskData,
        id: tempId,
        order: tempOrder,
        createdAt: new Date().toISOString()
      };

      setTasks(prev => [...prev, optimisticTask]);

      try {
        const saved = await apiAddTask(taskData);
        if (saved && saved.id && saved.id !== tempId) {
          setTasks(prev => prev.map(t => t.id === tempId ? saved : t));
          return saved;
        }
      } catch (apiError) {
        // Backend down - keep optimistic version
      }

      return optimisticTask;
    } catch (error) {
      console.error("Failed to add task:", error);
      return null;
    }
  };

  // Bulk add tasks - calls API for each so they all get persisted server-side
  const handleBulkAddTasks = async (newTasksArray) => {
    let currentMaxId = tasks.length > 0 ? Math.max(...tasks.map(t => t.id || 0)) : 0;
    let currentMaxOrder = tasks.length > 0 ? Math.max(...tasks.map(t => t.order || 0)) : 0;
    const optimisticTasks = newTasksArray.map(task => {
      currentMaxId += 1;
      currentMaxOrder += 1;
      return { ...task, id: currentMaxId, order: currentMaxOrder, createdAt: new Date().toISOString() };
    });

    setTasks(prev => [...prev, ...optimisticTasks]);

    for (let i = 0; i < newTasksArray.length; i++) {
      try {
        const saved = await apiAddTask(newTasksArray[i]);
        const optimisticId = optimisticTasks[i].id;
        if (saved && saved.id && saved.id !== optimisticId) {
          setTasks(prev => prev.map(t => t.id === optimisticId ? saved : t));
        }
      } catch (apiError) {
        // Skip server save if backend is down; localStorage still has it
      }
    }
  };

  // Delete task function
  const deleteTask = async (id) => {
    try {
      setTasks(prev => prev.filter(task => task.id !== id));
      try {
        await apiDeleteTask(id);
      } catch (apiError) {
        // Backend down - localStorage still has the deletion
      }
    } catch (error) {
      console.error("Failed to delete task:", error);
    }
  };

  // Filter tasks based on active milestone
  const activeMilestoneName = milestones.find(m => m.active)?.name || 'Pre-Production';
  const filteredTasks = tasks.filter(task => task.milestone === activeMilestoneName);

  // Calculate overall project progress for timeline
  const calculateProgress = () => {
    if (tasks.length === 0) return 0;
    
    const completedTasks = tasks.filter(task => task.completed).length;
    return Math.round((completedTasks / tasks.length) * 100);
  };

  // Format storage size for display
  const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0 || bytes === undefined) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
  };

  // Format date for display
  const formatDate = (date) => {
    if (!date) return "No Date Set";
    
    try {
      // Handle both Date objects and date strings
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      
      // Check if the date is valid
      if (isNaN(dateObj.getTime())) {
        return "Invalid Date";
      }
      
      const options = { year: 'numeric', month: 'short', day: 'numeric' };
      return dateObj.toLocaleDateString(undefined, options);
    } catch (error) {
      console.error("Date formatting error:", error);
      return "Date Error";
    }
  };

  // Open lore note in modal
  const openLoreNote = (note) => {
    setSelectedLoreNote(note);
    setShowLoreModal(true);
  };

  // Close lore modal
  const closeLoreModal = () => {
    setShowLoreModal(false);
    setSelectedLoreNote(null);
  };

  // Add lore note function
  const addLoreNote = (noteData) => {
    const newId = loreNotes.length > 0 ? Math.max(...loreNotes.map(n => n.id)) + 1 : 1;
    const newNote = { 
      ...noteData, 
      id: newId,
      createdAt: new Date().toISOString()
    };
    setLoreNotes([...loreNotes, newNote]);
    return newNote;
  };

  // Delete lore note function
  const deleteLoreNote = (id) => {
    setLoreNotes(loreNotes.filter(note => note.id !== id));
  };

  // Update lore note function
  const updateLoreNote = (id, updates) => {
    setLoreNotes(loreNotes.map(note => 
      note.id === id ? { ...note, ...updates } : note
    ));
  };
  const handleUpdateSettings = async (newSettings) => {
    try {
      // Save settings to localStorage
      localStorage.setItem('melodicJustice_adminSettings', JSON.stringify(newSettings));
      
      // Optionally, save to backend if you have an API endpoint
      // await axios.post('/api/settings', newSettings);
      
      console.log('Settings updated successfully');
    } catch (error) {
      console.error('Failed to update settings:', error);
      throw error;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 to-gray-800">
      {/* Redesigned Header */}
      <div className="w-full py-3 border-b-2 border-pink-400 bg-gradient-to-r from-pink-600 to-purple-600 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between h-auto sm:h-20">
          {/* Top Row: Logo, Title, and Dates */}
          <div className="flex items-center justify-between w-full mb-3 sm:mb-0">
            {/* Left Section: Logo and Title */}
            <div className="flex items-center flex-shrink-0">
              <div className="relative">
                <img 
                  src="/logo192.png" 
                  alt="Melodic Justice Logo"
                  className="h-10 w-auto mr-2 hover-scale drop-shadow-lg transition-all hover:rotate-3"
                />
                <div className="absolute -top-1 -right-1 h-3 w-3 bg-accent rounded-full animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-white text-lg font-bold drop-shadow-md tracking-wider whitespace-nowrap">MELODIC JUSTICE</h1>
                <p className="text-pink-100 text-xs drop-shadow-sm whitespace-nowrap">Animation Pipeline Dashboard</p>
              </div>
            </div>

            {/* Right Section: Project Dates (Current Date removed) */}
            <div className="text-white flex items-center gap-2 flex-shrink-0 ml-auto"> {/* Added ml-auto for spacing */}
              <div className="flex items-center gap-0.5 bg-black bg-opacity-20 px-2 py-0.5 rounded-full shadow-inner">
                <Calendar className="mr-0.5 w-2.5 h-2.5" />
                <span className="font-medium text-xs whitespace-nowrap">
                  Started: Jul 25, 2023
                </span>
              </div>
              
              <div className="flex items-center gap-0.5 bg-black bg-opacity-20 px-2 py-0.5 rounded-full shadow-inner">
                <Hourglass className="mr-0.5 w-2.5 h-2.5" />
                <span className="font-medium text-xs whitespace-nowrap">
                  Finish: {formatDate(estimatedFinishDate)}
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Row: Navigation Buttons */}
          <div className="flex justify-center w-full mt-4 sm:mt-0"> {/* Adjusted spacing for buttons */}
            {navButtons.map((button) => (
              <button
                key={button.id}
                onClick={() => handleNavButtonClick(button.id)}
                className={`
                  px-4 py-2 mx-1 rounded-lg text-sm font-medium transition-all duration-200 ease-in-out
                  ${activeTab === button.id 
                    ? 'bg-white text-pink-700 shadow-lg border border-pink-400 scale-105' 
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white border border-gray-700'
                  }
                `}
              >
                {button.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-6 py-6 flex-grow w-full">
        {/* Timeline Tab */}
        {activeTab === 'timeline' && (
          <div className="rounded-lg p-8 tab-content fade-in shadow-xl" style={{ backgroundColor: colors.secondary }}>
            <div className="mb-10">
              <h2 className="text-3xl font-bold text-white mb-3">Production Timeline</h2>
              <p className="text-gray-400 text-lg">Track your project's progress through major production phases</p>
            </div>
            
            <ProductionTimeline 
              milestones={milestones} 
              tasks={tasks}
              onToggleTask={updateTaskHandler}
              onSwitchToTasks={() => setActiveTab('tasks')}
            />
          </div>
        )}

        {/* Enhanced Overview Tab with Larger Components */}
        {activeTab === 'overview' && (
          <div className="space-y-10">
            {/* Enhanced Active Milestone & Timeline Section */}
            <div className="space-y-6 mb-8">
              {/* Main Timeline Header - Compact - Adjusted height and width */}
              <div className="text-center">
                <div className="inline-flex items-center gap-6 px-10 py-2 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-xl shadow-2xl border border-gray-700"> {/* py-2 (shorter), px-10 (wider) */}
                  <Clock className="h-4 w-4 text-pink-400" /> {/* Smaller icon */}
                  <div className="text-center">
                    <div className="text-xl font-bold text-white">{calculateProgress()}%</div> {/* Smaller font */}
                    <div className="text-sm text-gray-400">Complete</div>
                  </div>
                  <div className="h-6 w-px bg-gray-600"></div>
                  <div className="text-center">
                    <div className="text-base font-semibold text-pink-400">{tasks.filter(t => t.completed).length}</div> {/* Smaller font */}
                    <div className="text-xs text-gray-400">of {tasks.length} tasks</div>
                  </div>
                </div>
              </div>

              {/* Enhanced Progress Timeline */}
              <div className="relative">
                {/* Background timeline */}
                <div className="h-7 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 rounded-full shadow-inner border border-gray-600 overflow-hidden"> {/* Reduced height from h-8 to h-7 */}
                  {/* Progress fill with animated gradient */}
                  <div 
                    className="h-full bg-gradient-to-r from-pink-500 via-purple-500 to-pink-600 rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
                    style={{ width: `${calculateProgress()}%` }}
                  >
                    {/* Animated shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] animate-[shine_2s_ease-in-out_infinite]"></div>
                  </div>
                </div>

                {/* Milestone markers */}
                <div className="absolute top-0 left-0 w-full h-7 flex items-center"> {/* Adjusted height to h-7 */}
                  {milestones.sort((a, b) => a.order - b.order).map((milestone, index) => {
                    const position = ((index + 1) / milestones.length) * 100;
                    const milestoneTasks = tasks.filter(task => task.milestone === milestone.name);
                    const completedTasks = milestoneTasks.filter(task => task.completed);
                    const progress = milestoneTasks.length > 0 ? Math.round((completedTasks.length / milestoneTasks.length) * 100) : 0;
                    
                    return (
                      <div
                        key={milestone.id}
                        className="absolute transform -translate-x-1/2 -translate-y-1/2 top-1/2"
                        style={{ left: `${position}%` }}
                      >
                        {/* Milestone dot - now clickable */}
                        <div 
                          className={`
                            w-10 h-10 rounded-full border-4 transition-all duration-300 cursor-pointer relative
                            ${milestone.active 
                              ? 'bg-pink-500 border-pink-300 shadow-xl shadow-pink-500/50 scale-110' 
                              : progress === 100
                                ? 'bg-green-500 border-green-300 shadow-xl shadow-green-500/50'
                                : 'bg-gray-600 border-gray-400 hover:border-gray-300 hover:scale-105'
                            }
                          `}
                          onClick={() => toggleMilestone(milestone.id)} // Added onClick to milestone dot
                        >
                          {progress === 100 && (
                            <CheckCircle2 className="w-6 h-6 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                          )}
                          {milestone.active && (
                            <div className="absolute inset-0 rounded-full bg-pink-400 animate-ping opacity-30"></div>
                          )}
                          {milestone.active && (
                            <Sparkles className="w-5 h-5 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                          )}
                        </div>

                        {/* Tooltip on hover */}
                        <div className="absolute bottom-14 left-1/2 transform -translate-x-1/2 opacity-0 hover:opacity-100 transition-all duration-200 pointer-events-none">
                          <div className="bg-gray-900 text-white px-4 py-3 rounded-lg shadow-xl border border-gray-700 text-sm whitespace-nowrap">
                            <div className="font-semibold">{milestone.name}</div>
                            <div className="text-gray-400">{progress}% complete</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Milestone labels */}
                <div className="flex justify-between mt-8 px-6">
                  {milestones.sort((a, b) => a.order - b.order).map((milestone) => {
                    const milestoneTasks = tasks.filter(task => task.milestone === milestone.name);
                    const completedTasks = milestoneTasks.filter(task => task.completed);
                    const progress = milestoneTasks.length > 0 ? Math.round((completedTasks.length / milestoneTasks.length) * 100) : 0;
                    
                    return (
                      <div key={milestone.id} className="text-center flex-1">
                        <div className={`text-xl font-bold mb-2 ${
                          milestone.active ? 'text-pink-400' : progress === 100 ? 'text-green-400' : 'text-gray-400'
                        }`}>
                          {milestone.name}
                        </div>
                        <div className="text-base text-gray-500">
                          {progress}% • {completedTasks.length}/{milestoneTasks.length} tasks
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Enhanced Active Milestone Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-10">
              {/* Priority Tasks Section */}
              <div className="relative">
                {/* Background glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-purple-500/5 rounded-2xl blur-xl"></div>
                
                <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl overflow-hidden shadow-2xl border border-pink-500/30">
                  {/* Header */}
                  <div className="bg-gradient-to-r from-pink-900/40 to-purple-900/30 p-8 border-b border-gray-700/50">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-4 h-4 bg-pink-500 rounded-full animate-pulse shadow-lg shadow-pink-500/50"></div>
                        <h2 className="text-3xl font-bold text-white">Active: {milestones.find(m => m.active)?.name || 'Pre-Production'}</h2>
                        {/* Removed the "Set Pre-Production Active" button */}
                      </div>
                      <div className="flex items-center gap-3 px-4 py-2 bg-pink-600/20 rounded-full">
                        <Target className="h-5 w-5 text-pink-400" />
                        <span className="text-base text-pink-300 font-medium">
                          {Math.round((tasks.filter(t => t.milestone === (milestones.find(m => m.active)?.name || 'Pre-Production') && t.completed).length / Math.max(tasks.filter(t => t.milestone === (milestones.find(m => m.active)?.name || 'Pre-Production')).length, 1)) * 100)}%
                        </span>
                      </div>
                    </div>

                    {/* Enhanced Progress Bar */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-base font-medium text-gray-300">Milestone Progress</span>
                        <span className="text-base font-bold text-pink-400">
                          {tasks.filter(t => t.milestone === (milestones.find(m => m.active)?.name || 'Pre-Production') && t.completed).length} / {tasks.filter(t => t.milestone === (milestones.find(m => m.active)?.name || 'Pre-Production')).length} tasks
                        </span>
                      </div>
                      <div className="w-full bg-gray-700 h-4 rounded-full overflow-hidden shadow-inner">
                        <div
                          className="h-full bg-gradient-to-r from-pink-500 to-purple-600 rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
                          style={{ 
                            width: `${Math.round((tasks.filter(t => t.milestone === (milestones.find(m => m.active)?.name || 'Pre-Production') && t.completed).length / Math.max(tasks.filter(t => t.milestone === (milestones.find(m => m.active)?.name || 'Pre-Production')).length, 1)) * 100)}%` 
                          }}
                        >
                          {/* Animated shine effect */}
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] animate-[shine_3s_ease-in-out_infinite]"></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Priority Tasks */}
                  <div className="p-8">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold text-white flex items-center gap-3">
                        <Hourglass className="h-6 w-6 text-pink-400" />
                        Priority Tasks
                        <span className="text-base text-gray-400 font-normal">Next Up</span>
                      </h3>
                    </div>

                    <div className="space-y-4">
                      {priorityTasks.length > 0 ? priorityTasks.map((task, index) => (
                        <div 
                          key={task.id}
                          className={`
                            group relative p-5 rounded-xl transition-all duration-200 cursor-pointer
                            ${index === 0 
                              ? 'bg-gradient-to-r from-pink-900/30 to-purple-900/20 border border-pink-500/30 shadow-lg' 
                              : 'bg-gray-800/80 hover:bg-gray-700/80 border border-gray-700 hover:border-gray-600'
                            }
                          `}
                          onClick={() => updateTaskHandler(task.id)}
                        >
                          {/* Priority indicator for first task */}
                          {index === 0 && (
                            <div className="absolute -top-2 -right-2 bg-pink-500 text-white text-sm px-3 py-1 rounded-full shadow-lg">
                              Next Priority
                            </div>
                          )}

                          <div className="flex items-center gap-5">
                            <div className="flex-shrink-0">
                              <div className={`
                                w-8 h-8 rounded-full border-2 transition-all duration-200
                                ${index === 0 
                                  ? 'border-pink-400 group-hover:border-pink-300 group-hover:bg-pink-500/20' 
                                  : 'border-gray-500 group-hover:border-gray-400'
                                }
                              `}></div>
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className={`font-medium text-lg ${index === 0 ? 'text-white' : 'text-gray-200'}`}>
                                {task.name}
                              </div>
                              {task.category && (
                                <div className="text-base text-gray-400 mt-1">{task.category}</div>
                              )}
                            </div>

                            <div className="flex-shrink-0">
                              <ChevronRight className={`h-6 w-6 transition-all duration-200 ${
                                index === 0 ? 'text-pink-400' : 'text-gray-500 group-hover:text-gray-400'
                              }`} />
                            </div>
                          </div>
                        </div>
                      )) : (
                        <div className="text-center py-10">
                          <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
                          <div className="text-green-400 font-medium mb-2 text-lg">All current tasks completed!</div>
                          <div className="text-gray-400 text-base">Ready to advance to next milestone.</div>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-8 flex justify-end">
                      <button 
                        onClick={() => setActiveTab('tasks')}
                        className="px-8 py-4 bg-gradient-to-r from-pink-600 to-pink-700 hover:from-pink-500 hover:to-pink-600 text-white rounded-xl flex items-center gap-3 shadow-lg hover:shadow-xl transition-all transform hover:scale-105 text-lg font-medium"
                      >
                        <span>View All Tasks</span>
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Project Lore & Notes Section */}
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl overflow-hidden shadow-2xl border border-gray-700">
                <div className="p-8 border-b border-gray-700/50">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                      <Film className="w-6 h-6 text-pink-400" />
                      Project Lore & Notes
                    </h2>
                    <button 
                      className="px-4 py-2 bg-pink-600/80 hover:bg-pink-700 text-white rounded-lg text-base transition-all"
                      onClick={() => setActiveTab('notes')}
                    >
                      View All Notes
                    </button>
                  </div>
                </div>
                
                <div className="p-8">
                  {/* Quick Lore Overview */}
                  <div className="space-y-5">
                    {loreNotes.slice(0, 3).map((note) => {
                      const borderColor = note.color === 'pink' ? 'border-pink-500' : 
                                         note.color === 'cyan' ? 'border-cyan-500' : 
                                         'border-purple-500';
                      
                      return (
                        <div key={note.id} className={`bg-gray-800 rounded-lg p-5 border-l-4 ${borderColor} group relative`}>
                          <div className="flex justify-between items-start">
                            <h3 className="text-white font-medium mb-3 text-lg">{note.title}</h3>
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                              <button 
                                className="text-gray-400 hover:text-white text-sm p-1"
                                onClick={() => {
                                  // Replaced window.prompt with a custom modal for editing
                                  // For simplicity, I'm keeping the original prompt here for now.
                                  // In a full application, you'd trigger a modal component.
                                  const newTitle = prompt('Edit title:', note.title);
                                  if (newTitle && newTitle !== note.title) {
                                    updateLoreNote(note.id, { title: newTitle });
                                  }
                                }}
                              >
                                ✏️
                              </button>
                              <button 
                                className="text-gray-400 hover:text-red-400 text-sm p-1"
                                onClick={() => {
                                  // Replaced window.confirm with a custom modal for confirmation
                                  // For simplicity, I'm keeping the original confirm here for now.
                                  // In a full application, you'd trigger a modal component.
                                  if (window.confirm('Delete this note?')) {
                                    deleteLoreNote(note.id);
                                  }
                                }}
                              >
                                🗑️
                              </button>
                            </div>
                          </div>
                          <p 
                            className="text-gray-400 text-base cursor-pointer hover:text-gray-300"
                            onClick={() => openLoreNote(note)}
                          >
                            {note.content.length > 120 ? `${note.content.substring(0, 120)}...` : note.content}
                          </p>
                        </div>
                      );
                    })}
                    
                    {/* Add new note button */}
                    <button 
                      className="w-full bg-gray-800/50 rounded-lg p-5 border-2 border-dashed border-gray-600 hover:border-pink-500 transition-colors text-gray-400 hover:text-white text-lg"
                      onClick={() => {
                        // Replaced window.prompt with custom modals for input
                        const title = prompt('Note title:');
                        const content = prompt('Note content:');
                        const category = prompt('Category (Character/World Building/Theme):') || 'General';
                        
                        if (title && content) {
                          const colors = ['pink', 'cyan', 'purple'];
                          const randomColor = colors[Math.floor(Math.random() * colors.length)];
                          addLoreNote({ title, content, category, color: randomColor });
                        }
                      }}
                    >
                      + Add New Lore Note
                    </button>
                    
                    <div className="grid grid-cols-2 gap-4 mt-6">
                      <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                        <div className="text-pink-400 font-bold text-2xl">
                          {loreNotes.filter(note => note.category === 'Character').length}
                        </div>
                        <div className="text-gray-400 text-sm">World Building</div>
                      </div>
                      <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                        <div className="text-cyan-400 font-bold text-2xl">
                          {loreNotes.filter(note => note.category === 'World Building').length}
                        </div>
                        <div className="text-gray-400 text-sm">World Building</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Project Stats Grid - Moved to Bottom */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Object.entries(projectStats).map(([key, stat]) => (
                <div 
                  key={key} 
                  className="rounded-xl p-5 hover-glow transition-all fade-in cursor-pointer shadow-xl"
                  style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)' }}
                  onClick={() => {
                    // Link each stat card to the appropriate tab
                    if (key === 'scenes' || key === 'shots') {
                      setActiveTab('shots');
                    } else if (key === 'characters') {
                      setActiveTab('concepts');
                    } else if (key === 'music') {
                      setActiveTab('notes');
                    }
                  }}
                >
                  <div className="flex items-center justify-between pb-3">
                    <span className="text-base font-medium text-gray-300">{stat.label}</span>
                    <div className="flex space-x-3 items-center">
                      <div className="text-pink-400">
                        {getIcon(stat.iconType)}
                      </div>
                      <button 
                        className="p-1 rounded-full hover:bg-gray-800 transition-all"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingStatCard(key);
                        }}
                      >
                        <Edit className="h-4 w-4 text-gray-400 hover:text-white" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="text-3xl font-bold text-white mb-3 flex items-end">
                    <span>{stat.completed}</span>
                    <span className="text-lg text-gray-400">/{stat.total}</span>
                    
                    {/* Progress indicator */}
                    <span className="ml-2 text-sm text-gray-400">
                      ({Math.round((stat.completed / stat.total) * 100)}%)
                    </span>
                  </div>
                  
                  <div className="w-full bg-gray-700 h-3 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full animate-progress transition-all duration-1000"
                      style={{ 
                        width: `${(stat.completed / stat.total) * 100}%`,
                        backgroundImage: `linear-gradient(to right, ${colors.accent}, ${colors.primary})`
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tasks Tab */}
        {activeTab === 'tasks' && (
          <TasksPage
            tasks={tasks}
            milestones={milestones}
            onAddTask={addTask}
            onUpdateTask={updateTaskHandler}
            onDeleteTask={deleteTask}
            onBulkAddTasks={handleBulkAddTasks}
            onBulkDeleteTasks={bulkDeleteTasks}
            onReorderTasks={reorderTasks}
            quickAddTick={quickAddTick}
          />
        )}

        {/* Shots Tab */}
        {activeTab === 'shots' && (
          <ShotList />
        )}
        
        {/* Notes Tab */}
        {activeTab === 'notes' && (
          <div className="rounded-lg p-8 fade-in shadow-xl" style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)' }}>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-3">Lore & Reference</h2>
              <p className="text-gray-400 text-lg">Character profiles, world-building, and story details</p>
            </div>
            
            <LoreNotes 
              notes={loreNotes}
              onAddNote={addLoreNote}
              onUpdateNote={updateLoreNote}
              onDeleteNote={deleteLoreNote}
              onOpenNote={openLoreNote}
              onUpdateNotes={(updatedNotes) => {
                setLoreNotes(updatedNotes);
                console.log(`Updated ${updatedNotes.length} lore notes`);
              }} 
            />
          </div>
        )}
        
        {/* Concepts Tab */}
        {activeTab === 'concepts' && (
          <ConceptBoard />
        )}

        {/* Lore Note Modal */}
        {showLoreModal && selectedLoreNote && (
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 rounded-2xl w-full max-w-3xl max-h-[80vh] shadow-2xl border border-gray-700 flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-8 border-b border-gray-800">
                <div className="flex items-center gap-4">
                  <div 
                    className={`w-5 h-5 rounded-full ${
                      selectedLoreNote.color === 'pink' ? 'bg-pink-500' : 
                      selectedLoreNote.color === 'cyan' ? 'bg-cyan-500' : 
                      'bg-purple-500'
                    }`}
                  ></div>
                  <input
                    type="text"
                    value={selectedLoreNote.title}
                    onChange={(e) => {
                      const updatedNote = { ...selectedLoreNote, title: e.target.value };
                      setSelectedLoreNote(updatedNote);
                      updateLoreNote(selectedLoreNote.id, { title: e.target.value });
                    }}
                    className="text-2xl font-bold text-white bg-transparent border-none outline-none focus:bg-gray-800 rounded px-3 py-2"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-400 bg-gray-800 px-3 py-2 rounded">
                    {selectedLoreNote.category || 'General'}
                  </span>
                  <button 
                    className="text-gray-400 hover:text-white transition-all p-2"
                    onClick={closeLoreModal}
                  >
                    <XCircle className="h-7 w-7" />
                  </button>
                </div>
              </div>
              
              {/* Content */}
              <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
                <textarea
                  value={selectedLoreNote.content}
                  onChange={(e) => {
                    const updatedNote = { ...selectedLoreNote, content: e.target.value };
                    setSelectedLoreNote(updatedNote);
                    updateLoreNote(selectedLoreNote.id, { content: e.target.value });
                  }}
                  className="w-full h-full min-h-[300px] bg-transparent text-gray-300 border-none outline-none resize-none text-lg leading-relaxed"
                  placeholder="Write your lore note here..."
                />
              </div>
              
              {/* Footer */}
              <div className="flex items-center justify-between p-8 border-t border-gray-800">
                <div className="flex items-center gap-4">
                  <select
                    value={selectedLoreNote.category || 'General'}
                    onChange={(e) => {
                      const updatedNote = { ...selectedLoreNote, category: e.target.value };
                      setSelectedLoreNote(updatedNote);
                      updateLoreNote(selectedLoreNote.id, { category: e.target.value });
                    }}
                    className="bg-gray-800 text-white border border-gray-700 rounded px-4 py-2 text-base"
                  >
                    <option value="Character">Character</option>
                    <option value="World Building">World Building</option>
                    <option value="Theme">Theme</option>
                    <option value="Plot">Plot</option>
                    <option value="Music/Audio">Music/Audio</option>
                    <option value="Technology">Technology</option>
                    <option value="General">General</option>
                  </select>
                  
                  <select
                    value={selectedLoreNote.color || 'pink'}
                    onChange={(e) => {
                      const updatedNote = { ...selectedLoreNote, color: e.target.value };
                      setSelectedLoreNote(updatedNote);
                      updateLoreNote(selectedLoreNote.id, { color: e.target.value });
                    }}
                    className="bg-gray-800 text-white border border-gray-700 rounded px-4 py-2 text-base"
                  >
                    <option value="pink">Pink</option>
                    <option value="cyan">Cyan</option>
                    <option value="purple">Purple</option>
                  </select>
                </div>
                
                <div className="flex items-center gap-3">
                  {selectedLoreNote.createdAt && (
                    <span className="text-sm text-gray-500">
                      Created: {new Date(selectedLoreNote.createdAt).toLocaleDateString()}
                    </span>
                  )}
                  <button 
                    className="text-red-400 hover:text-red-300 transition-all p-2"
                    onClick={() => {
                      if (window.confirm('Delete this lore note?')) {
                        deleteLoreNote(selectedLoreNote.id);
                        closeLoreModal();
                      }
                    }}
                  >
                    <XCircle className="h-6 w-6" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Edit Stat Card Modal */}
        {editingStatCard && (
          <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50 modal">
            <div className="bg-gray-900 rounded-lg p-8 max-w-md w-full shadow-2xl border border-gray-800">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-bold text-white">Edit {projectStats[editingStatCard].label}</h3>
                <button 
                  className="text-gray-400 hover:text-white transition-all"
                  onClick={() => setEditingStatCard(null)}
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-gray-400 mb-2 text-base">Label</label>
                  <input 
                    type="text"
                    value={projectStats[editingStatCard].label}
                    onChange={(e) => setProjectStats(prev => ({
                      ...prev,
                      [editingStatCard]: {
                        ...prev[editingStatCard],
                        label: e.target.value
                      }
                    }))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-pink-500 focus:outline-none text-base"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-400 mb-2 text-base">Total</label>
                    <input 
                      type="number"
                      value={projectStats[editingStatCard].total}
                      onChange={(e) => setProjectStats(prev => ({
                        ...prev,
                        [editingStatCard]: {
                          ...prev[editingStatCard],
                          total: parseInt(e.target.value) || 0
                        }
                      }))}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-pink-500 focus:outline-none text-base"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-400 mb-2 text-base">Completed</label>
                    <input 
                      type="number"
                      value={projectStats[editingStatCard].completed}
                      onChange={(e) => setProjectStats(prev => ({
                        ...prev,
                        [editingStatCard]: {
                          ...prev[editingStatCard],
                          completed: parseInt(e.target.value) || 0
                        }
                      }))}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-pink-500 focus:outline-none text-base"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end gap-4 pt-6">
                  <button 
                    className="px-6 py-3 rounded-lg border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 transition-all text-base"
                    onClick={() => setEditingStatCard(null)}
                  >
                    Cancel
                  </button>
                  <button 
                    className="px-6 py-3 rounded-lg text-white shadow-md hover:shadow-lg transition-all bg-gradient-to-r from-pink-500 to-pink-600 text-base"
                    onClick={() => setEditingStatCard(null)}
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Admin Settings Modal */}
        <AdminSettings
          isOpen={showAdminSettings}
          onClose={() => setShowAdminSettings(false)}
          systemStatus={systemStatus}
          onUpdateSettings={handleUpdateSettings}
        />
      </div>
      
      {/* Footer */}
      <div className="bg-gray-900 border-t border-gray-800 p-4 text-center text-gray-500">
        <div className="max-w-7xl mx-auto">
          Melodic Justice Animation Dashboard v1.3
        </div>
      </div>
    </div>
  );
}

export default App;
