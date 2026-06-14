import React, { useState, useEffect, useRef } from 'react';
import { Check, UploadCloud, X, Search, ArrowUpDown, Eye, Clock, Film, Trash2, Upload } from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../api';

// Colors from the main app
const colors = {
  primary: '#f7abff',    // Pink background
  secondary: '#2f2a2f',  // Dark gray/black
  accent: '#3CDFFF',     // Cyan blue accent
  darkAccent: '#620f87', // Deep purple
  light: '#f9f9f9',      // White text
  midGray: '#797979',    // Mid gray
  successGreen: '#4ADE80',
  warningOrange: '#F97316',
  errorRed: '#EF4444'
};

// Custom status options based on your workflow
const statusOptions = [
  { value: 'SCRIPT', label: 'SCRIPT', color: colors.warningOrange },
  { value: 'STRYBRD', label: 'STRYBRD', color: colors.warningOrange },
  { value: 'REF', label: 'REF', color: colors.warningOrange },
  { value: 'BLCKOUT', label: 'BLCKOUT', color: colors.warningOrange },
  { value: 'MOCAP', label: 'MOCAP', color: colors.warningOrange },
  { value: 'VFX', label: 'VFX', color: colors.warningOrange },
  { value: 'SFX', label: 'SFX', color: colors.warningOrange },
  { value: 'MUSIC', label: 'MUSIC', color: colors.warningOrange },
  { value: 'DONE DONE', label: 'DONE DONE', color: colors.successGreen }
];

// Storyboard thumbnail component with loading states
const StoryboardThumbnail = ({ shot }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  
  if (!shot.storyboard) {
    return (
      <div className="w-20 h-12 bg-gray-700 rounded flex items-center justify-center">
        <span className="text-gray-500 text-xs">No board</span>
      </div>
    );
  }
  
  if (imageError) {
    return (
      <div className="w-20 h-12 bg-red-900 rounded flex items-center justify-center">
        <span className="text-red-300 text-xs">Error</span>
      </div>
    );
  }
  
  return (
    <div className="relative w-20 h-12 rounded overflow-hidden">
      {imageLoading && (
        <div className="absolute inset-0 bg-gray-700 animate-pulse flex items-center justify-center">
          <div className="text-gray-500 text-xs">Loading...</div>
        </div>
      )}
      <img
        src={`${API_URL}/shots/${shot.id}/storyboard`}
        alt={`Storyboard for shot ${shot.id}`}
        className={`w-full h-full object-cover cursor-pointer hover:opacity-80 transition-opacity ${
          imageLoading ? 'opacity-0' : 'opacity-100'
        }`}
        onLoad={() => setImageLoading(false)}
        onError={() => {
          setImageError(true);
          setImageLoading(false);
        }}
        onClick={() => {
          shot.onThumbnailClick(shot);
        }}
      />
    </div>
  );
};

const ShotList = () => {
  // State for shot list data - load from localStorage or start empty
  const [shots, setShots] = useState(() => {
    const savedShots = localStorage.getItem('melodicJustice_shots');
    return savedShots ? JSON.parse(savedShots) : [];
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // State for filtering and sorting
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [scriptPageFilter, setScriptPageFilter] = useState('All');
  const [storyboardFilter, setStoryboardFilter] = useState('All');
  const [sortBy, setSortBy] = useState({ field: 'id', direction: 'asc' });
  
  // State for file upload
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // State for shot modal
  const [selectedShot, setSelectedShot] = useState(null);
  const [showShotModal, setShowShotModal] = useState(false);
  
  // State for storyboard upload
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadingShotId, setUploadingShotId] = useState(null);
  const fileInputRef = useRef(null);
  
  // State for slideshow
  const [showSlideshow, setShowSlideshow] = useState(false);
  const [showStoryboardSlideshow, setShowStoryboardSlideshow] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [currentSlideshot, setCurrentSlideshot] = useState(null);
  
  // State for drag and drop
  const [dragActive, setDragActive] = useState(false);

  // State for bulk operations
  const [selectedShots, setSelectedShots] = useState(new Set());

  // Derived state
  const [uniqueScriptPages, setUniqueScriptPages] = useState([]);
  
  // Save shots to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('melodicJustice_shots', JSON.stringify(shots));
  }, [shots]);
  
  // Update unique script pages when shots change
  useEffect(() => {
    if (shots.length > 0) {
      const pages = [...new Set(shots.map(shot => shot.scriptPage || 'Unknown'))];
      setUniqueScriptPages(['All', ...pages.sort((a, b) => {
        // Try to sort numerically if possible
        const numA = parseInt(a);
        const numB = parseInt(b);
        if (!isNaN(numA) && !isNaN(numB)) {
          return numA - numB;
        }
        return a.localeCompare(b);
      })]);
    } else {
      setUniqueScriptPages(['All']);
    }
  }, [shots]);
  
  // Keyboard navigation for slideshow
  useEffect(() => {
    if (showSlideshow || showStoryboardSlideshow) {
      const handleKeyDown = (event) => {
        switch (event.key) {
          case 'ArrowLeft':
            if (showStoryboardSlideshow) {
              navigateStoryboardSlideshow('prev');
            } else {
              navigateSlideshow('prev');
            }
            break;
          case 'ArrowRight':
            if (showStoryboardSlideshow) {
              navigateStoryboardSlideshow('next');
            } else {
              navigateSlideshow('next');
            }
            break;
          case 'Escape':
            setShowSlideshow(false);
            setShowStoryboardSlideshow(false);
            break;
          default:
            break;
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [showSlideshow, showStoryboardSlideshow, currentSlideIndex]);

  // Handle file upload
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Check file extension
      const allowedTypes = ['.xlsx', '.xls', '.csv'];
      const fileExt = selectedFile.name.substring(selectedFile.name.lastIndexOf('.')).toLowerCase();
      
      if (!allowedTypes.includes(fileExt)) {
        setError('Please upload an Excel (.xlsx, .xls) or CSV (.csv) file.');
        return;
      }
      
      setFile(selectedFile);
      setError(null);
    }
  };
  
  const handleFileUpload = async () => {
    if (!file) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    setError(null);
    
    // Create FormData for file upload
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      // Process file locally since we know the format
      await processFileLocally(file);
    } catch (error) {
      setError('Failed to process file. Please check the format and try again.');
      console.error('Local processing failed:', error);
    } finally {
      setIsUploading(false);
      setFile(null);
      setUploadProgress(0);
    }
  };
  
  // Process file locally
  const processFileLocally = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const data = e.target.result;
          let newShots = [];
          
          if (file.name.endsWith('.csv')) {
            // Parse CSV
            const lines = data.split('\n');
            const headers = lines[0].split(',').map(h => h.trim());
            
            // Find the column indices based on your CSV structure
            const shotNumIdx = headers.findIndex(h => h.includes('SHOT #'));
            const descIdx = headers.findIndex(h => h.includes('DESCRIPTION'));
            const scriptIdx = headers.findIndex(h => h === 'SCRIPT');
            
            // Find status columns
            const statusColumns = ['SCRIPT', 'STRYBRD', 'REF', 'BLCKOUT', 'MOCAP', 'VFX', 'SFX', 'MUSIC', 'DONE DONE'];
            const statusIndices = {};
            statusColumns.forEach(col => {
              statusIndices[col] = headers.findIndex(h => h === col);
            });
            
            for (let i = 1; i < lines.length; i++) {
              if (!lines[i].trim()) continue;
              
              const values = lines[i].split(',');
              
            // Determine current status based on which column has "x"
            let currentStatus = 'SCRIPT';
            for (let j = statusColumns.length - 1; j >= 0; j--) {
              const colName = statusColumns[j];
              const idx = statusIndices[colName];
              if (idx !== -1 && values[idx]?.trim().toLowerCase() === 'x') {
                currentStatus = colName;
                break;
              }
            }
              
              const shot = {
                id: values[shotNumIdx]?.trim() || String(i),
                description: values[descIdx]?.trim() || '',
                scriptPage: values[scriptIdx]?.trim() || 'Unknown',
                status: currentStatus,
                lastUpdate: new Date().toISOString()
              };
              
              newShots.push(shot);
            }
            
            setShots(newShots);
            resolve();
          } else {
            reject(new Error('Excel format not supported in local processing'));
          }
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  };

  // Handle status change for a shot
  const handleStatusChange = async (shotId, newStatus) => {
    try {
      // Find the shot and update its status
      const updatedShots = shots.map(shot => 
        shot.id === shotId ? { 
          ...shot, 
          status: newStatus, 
          lastUpdate: new Date().toISOString() 
        } : shot
      );
      
      setShots(updatedShots);
      
      // Try to update on server if available
      try {
        await axios.put(`${API_URL}/shots/${shotId}`, updatedShots.find(s => s.id === shotId));
      } catch (error) {
      }
    } catch (error) {
      setError('Failed to update shot status. Please try again.');
      console.error('Error updating shot status:', error);
    }
  };
  
  // Handle sorting
  const handleSort = (field) => {
    setSortBy(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };
  
  // Open shot details modal
  const handleOpenShotDetails = (shot) => {
    setSelectedShot(shot);
    setShowShotModal(true);
  };
  
  // Close shot details modal
  const handleCloseShotModal = () => {
    setShowShotModal(false);
    setSelectedShot(null);
  };
  
  // Handle storyboard upload
  const handleUpload = async () => {
    if (!selectedFile || !uploadingShotId) return;
    
    setUploading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('storyboard', selectedFile);
      
      const response = await axios.post(`${API_URL}/shots/${uploadingShotId}/storyboard`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Update local state
      setShots(shots.map(shot => 
        shot.id === uploadingShotId ? { ...shot, storyboard: true } : shot
      ));
      
      setShowUploadModal(false);
      setSelectedFile(null);
      setUploadingShotId(null);
    } catch (error) {
      setError('Failed to upload storyboard. Please try again.');
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };
  
  // Delete a single storyboard. Pass { silent: true } to skip the prompt —
  // used by the bulk handler so we don't pop 200 confirms in a row.
  const handleDeleteStoryboard = async (shotId, { silent = false } = {}) => {
    if (!silent && !window.confirm('Delete this storyboard?')) return;

    try {
      await axios.delete(`${API_URL}/shots/${shotId}/storyboard`);
      setShots(prev => prev.map(s =>
        s.id === shotId ? { ...s, storyboard: false } : s
      ));
    } catch (error) {
      setError('Failed to delete storyboard. Please try again.');
      console.error('Delete error:', error);
    }
  };
  
  // Slideshow navigation - regular slideshow
  const navigateSlideshow = (direction) => {
    const currentIndex = filteredAndSortedShots.findIndex(shot => shot.id === currentSlideshot?.id);
    let nextIndex;
    
    if (direction === 'prev') {
      nextIndex = currentIndex - 1;
      if (nextIndex < 0) nextIndex = filteredAndSortedShots.length - 1;
    } else {
      nextIndex = currentIndex + 1;
      if (nextIndex >= filteredAndSortedShots.length) nextIndex = 0;
    }
    
    setCurrentSlideshot(filteredAndSortedShots[nextIndex]);
    setCurrentSlideIndex(nextIndex);
  };
  
  // Slideshow navigation - storyboard slideshow
  const navigateStoryboardSlideshow = (direction) => {
    const sortedShots = [...filteredAndSortedShots].sort((a, b) => {
      if (!isNaN(a.id) && !isNaN(b.id)) {
        return parseInt(a.id) - parseInt(b.id);
      }
      return a.id.localeCompare(b.id);
    });
    
    let nextIndex = currentSlideIndex;
    
    if (direction === 'prev') {
      nextIndex = currentSlideIndex - 1;
      if (nextIndex < 0) nextIndex = sortedShots.length - 1;
    } else {
      nextIndex = currentSlideIndex + 1;
      if (nextIndex >= sortedShots.length) nextIndex = 0;
    }
    
    setCurrentSlideIndex(nextIndex);
  };

  // Drag and drop handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.match(/image.*/)) {
        setSelectedFile(file);
        setError(null);
      } else {
        setError('Please drop an image file (JPG or PNG)');
      }
    }
  };
  
  // Filter and sort shots
  const filteredAndSortedShots = shots
    .filter(shot => {
      // Apply search filter
      const matchesSearch = 
        shot.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shot.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Apply status filter
      const matchesStatus = statusFilter === 'All' || shot.status === statusFilter;
      
      // Apply script page filter
      const matchesScriptPage = scriptPageFilter === 'All' || shot.scriptPage === scriptPageFilter;
      
      // Apply storyboard filter
      const matchesStoryboard = storyboardFilter === 'All' || 
        (storyboardFilter === 'With Storyboards' && shot.storyboard) ||
        (storyboardFilter === 'Without Storyboards' && !shot.storyboard);
      
      return matchesSearch && matchesStatus && matchesScriptPage && matchesStoryboard;
    })
    .sort((a, b) => {
      // Apply sorting
      const direction = sortBy.direction === 'asc' ? 1 : -1;
      
      if (sortBy.field === 'id') {
        if (!isNaN(a.id) && !isNaN(b.id)) {
          return direction * (parseInt(a.id) - parseInt(b.id));
        }
        return direction * a.id.localeCompare(b.id);
      }
      
      if (sortBy.field === 'lastUpdate') {
        return direction * (new Date(a.lastUpdate || 0) - new Date(b.lastUpdate || 0));
      }
      
      if (a[sortBy.field] < b[sortBy.field]) return -1 * direction;
      if (a[sortBy.field] > b[sortBy.field]) return 1 * direction;
      return 0;
    });
  
  // Calculate stats
  const totalShots = shots.length;
  const completeShots = shots.filter(shot => shot.status === 'DONE DONE').length;
  const inProgressShots = shots.filter(shot => shot.status !== 'SCRIPT' && shot.status !== 'DONE DONE').length;
  const scriptShots = shots.filter(shot => shot.status === 'SCRIPT').length;
  const withStoryboards = shots.filter(shot => shot.storyboard).length;
  
  // Get status color
  const getStatusColor = (status) => {
    const statusOption = statusOptions.find(opt => opt.value === status);
    return statusOption ? statusOption.color : colors.midGray;
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    } catch (e) {
      return 'Invalid date';
    }
  };

  return (
    <div className="rounded-lg p-4" style={{ backgroundColor: colors.secondary }}>
      {/* Header with stats */}
      <div className="flex flex-wrap justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">Shot List</h2>
          <p className="text-gray-400">Track and manage your animation shots</p>
        </div>
        
        <div className="flex space-x-4 text-white">
          <div className="text-center">
            <div className="text-2xl font-bold">{totalShots}</div>
            <div className="text-sm text-gray-400">Total Shots</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold" style={{ color: colors.successGreen }}>{completeShots}</div>
            <div className="text-sm text-gray-400">DONE DONE</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold" style={{ color: colors.warningOrange }}>{inProgressShots}</div>
            <div className="text-sm text-gray-400">In Progress</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold" style={{ color: colors.accent }}>{withStoryboards}</div>
            <div className="text-sm text-gray-400">With Storyboards</div>
          </div>
          <div className="text-center">
            <button
              onClick={() => {
                setCurrentSlideIndex(0);
                setShowStoryboardSlideshow(true);
              }}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 flex items-center gap-2"
            >
              <Film className="h-4 w-4" />
              Storyboard Slideshow
            </button>
          </div>
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between mb-1">
          <div className="text-sm text-white">Overall Progress</div>
          <div className="text-sm text-white">{Math.round((completeShots / totalShots) * 100) || 0}%</div>
        </div>
        <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden">
          <div className="flex h-full">
            <div 
              className="h-full"
              style={{ 
                width: `${(completeShots / totalShots) * 100}%`,
                backgroundColor: colors.successGreen
              }}
            ></div>
            <div 
              className="h-full"
              style={{ 
                width: `${(inProgressShots / totalShots) * 100}%`,
                backgroundColor: colors.warningOrange
              }}
            ></div>
          </div>
        </div>
      </div>
      {/* Filter bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search shots..."
            className="bg-gray-800 text-white pl-10 pr-4 py-2 rounded w-full border border-gray-700"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex space-x-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-gray-800 text-white px-3 py-2 rounded border border-gray-700 flex-grow"
          >
            <option value="All">All Statuses</option>
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          
          <select
            value={storyboardFilter}
            onChange={(e) => setStoryboardFilter(e.target.value)}
            className="bg-gray-800 text-white px-3 py-2 rounded border border-gray-700 flex-grow"
          >
            <option value="All">All</option>
            <option value="With Storyboards">With Storyboards</option>
            <option value="Without Storyboards">Without Storyboards</option>
          </select>
        </div>
        
        <div className="flex space-x-2">
          <select
            value={scriptPageFilter}
            onChange={(e) => setScriptPageFilter(e.target.value)}
            className="bg-gray-800 text-white px-3 py-2 rounded border border-gray-700 flex-grow"
          >
            {uniqueScriptPages.map(page => (
              <option key={page} value={page}>{page === 'Unknown' ? 'Unknown' : `Page ${page}`}</option>
            ))}
          </select>
        </div>
        
        <div className="flex space-x-2">
          <div className="relative flex-grow">
            <input
              type="file"
              id="shot-list-upload"
              className="hidden"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileChange}
            />
            <label
              htmlFor="shot-list-upload"
              className="cursor-pointer bg-gray-800 text-white px-3 py-2 rounded border border-gray-700 flex items-center justify-center w-full"
            >
              <UploadCloud className="h-5 w-5 mr-2" />
              {file ? file.name : 'Import Shot List...'}
            </label>
          </div>
          
          <button
            className={`px-3 py-2 rounded flex items-center justify-center ${file ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-400 cursor-not-allowed'}`}
            disabled={!file || isUploading}
            onClick={handleFileUpload}
            style={{ backgroundColor: file ? colors.accent : undefined }}
          >
            Upload
          </button>
        </div>
      </div>
      
      {/* Bulk selection actions */}
      {selectedShots.size > 0 && (
        <div className="col-span-full bg-gray-800 rounded p-3 flex items-center justify-between mb-6">
          <span className="text-white">{selectedShots.size} shots selected</span>
          <div className="flex gap-2">
            <button
              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm"
              onClick={async () => {
                const ids = [...selectedShots];
                if (!window.confirm(`Delete ${ids.length} shot${ids.length === 1 ? '' : 's'}? This removes the entries entirely.`)) return;
                try {
                  await Promise.allSettled(ids.map(id => axios.delete(`${API_URL}/shots/${id}`)));
                  setShots(prev => prev.filter(s => !selectedShots.has(s.id)));
                  setSelectedShots(new Set());
                } catch (e) {
                  console.error('Bulk shot delete failed:', e);
                }
              }}
            >
              Delete {selectedShots.size} Shot{selectedShots.size === 1 ? '' : 's'}
            </button>
            <button
              className="px-3 py-1 bg-red-800 hover:bg-red-900 text-white rounded text-sm"
              onClick={async () => {
                const ids = [...selectedShots].filter(id => shots.find(s => s.id === id)?.storyboard);
                if (ids.length === 0) {
                  window.alert('None of the selected shots have a storyboard.');
                  return;
                }
                if (!window.confirm(`Delete storyboards for ${ids.length} shot${ids.length === 1 ? '' : 's'}?`)) return;
                await Promise.allSettled(ids.map(id => handleDeleteStoryboard(id, { silent: true })));
                setSelectedShots(new Set());
              }}
            >
              Delete Storyboards Only
            </button>
            <button
              className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm"
              onClick={() => setSelectedShots(new Set())}
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}
      
      {/* Upload progress */}
      {isUploading && (
        <div className="mb-4">
          <div className="text-sm text-white mb-1">Uploading: {uploadProgress}%</div>
          <div className="w-full bg-gray-700 h-2 rounded-full">
            <div 
              className="h-full rounded-full"
              style={{ 
                width: `${uploadProgress}%`,
                backgroundColor: colors.accent
              }}
            ></div>
          </div>
        </div>
      )}
      
      {/* Error message */}
      {error && (
        <div className="mb-4 p-3 bg-red-900 bg-opacity-30 border border-red-800 rounded text-red-100">
          {error}
        </div>
      )}
      {/* Shot list table */}
      <div className="overflow-x-auto bg-gray-900 rounded-lg">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="px-4 py-3 text-left text-gray-400">
                <input
                  type="checkbox"
                  checked={selectedShots.size === filteredAndSortedShots.length && filteredAndSortedShots.length > 0}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedShots(new Set(filteredAndSortedShots.map(s => s.id)));
                    } else {
                      setSelectedShots(new Set());
                    }
                  }}
                  className="rounded"
                />
              </th>
              <th 
                className="px-4 py-3 text-left text-gray-400 cursor-pointer"
                onClick={() => handleSort('id')}
              >
                <div className="flex items-center">
                  Shot #
                  {sortBy.field === 'id' && (
                    <ArrowUpDown className="h-4 w-4 ml-1" />
                  )}
                </div>
              </th>
              <th 
                className="px-4 py-3 text-left text-gray-400 cursor-pointer"
                onClick={() => handleSort('scriptPage')}
              >
                <div className="flex items-center">
                  Script Page #
                  {sortBy.field === 'scriptPage' && (
                    <ArrowUpDown className="h-4 w-4 ml-1" />
                  )}
                </div>
              </th>
              <th className="px-4 py-3 text-left text-gray-400">Description</th>
              <th className="px-4 py-3 text-left text-gray-400">Status</th>
              <th className="px-4 py-3 text-left text-gray-400">Storyboard</th>
              <th 
                className="px-4 py-3 text-left text-gray-400 cursor-pointer"
                onClick={() => handleSort('lastUpdate')}
              >
                <div className="flex items-center">
                  Last Updated
                  {sortBy.field === 'lastUpdate' && (
                    <ArrowUpDown className="h-4 w-4 ml-1" />
                  )}
                </div>
              </th>
              <th className="px-4 py-3 text-center text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="8" className="px-4 py-8 text-center text-gray-400">
                  Loading shot list...
                </td>
              </tr>
            ) : filteredAndSortedShots.length === 0 ? (
              <tr>
                <td colSpan="8" className="px-4 py-8 text-center text-gray-400">
                  {shots.length === 0 ? 'No shots added yet. Import a shot list to get started.' : 'No shots found matching your filters.'}
                </td>
              </tr>
            ) : (
              filteredAndSortedShots.map(shot => (
                <tr key={shot.id} className="border-b border-gray-800 hover:bg-gray-800">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedShots.has(shot.id)}
                      onChange={(e) => {
                        const newSelected = new Set(selectedShots);
                        if (e.target.checked) {
                          newSelected.add(shot.id);
                        } else {
                          newSelected.delete(shot.id);
                        }
                        setSelectedShots(newSelected);
                      }}
                      className="rounded"
                    />
                  </td>
                  <td className="px-4 py-3 text-white">{shot.id}</td>
                  <td className="px-4 py-3 text-white">{shot.scriptPage}</td>
                  <td className="px-4 py-3 text-white">{shot.description}</td>
                  <td className="px-4 py-3">
                    <select
                      value={shot.status}
                      onChange={(e) => handleStatusChange(shot.id, e.target.value)}
                      className="bg-gray-800 text-white px-2 py-1 rounded border border-gray-700"
                      style={{ color: getStatusColor(shot.status) }}
                    >
                      {statusOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <StoryboardThumbnail 
                      shot={{
                        ...shot,
                        onThumbnailClick: (shot) => {
                          setCurrentSlideshot(shot);
                          setShowSlideshow(true);
                        }
                      }} 
                    />
                  </td>
                  <td className="px-4 py-3 text-gray-400">{formatDate(shot.lastUpdate)}</td>
                  <td className="px-4 py-3">
                    <div className="flex space-x-2 justify-center">
                      <button
                        className="p-1 text-blue-400 hover:text-blue-300"
                        onClick={() => handleOpenShotDetails(shot)}
                        title="View details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      {shot.storyboard ? (
                        <button
                          className="p-1 text-red-400 hover:text-red-300"
                          onClick={() => handleDeleteStoryboard(shot.id)}
                          title="Delete storyboard"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      ) : (
                        <button
                          className="p-1 text-purple-400 hover:text-purple-300"
                          onClick={() => {
                            setUploadingShotId(shot.id);
                            setShowUploadModal(true);
                          }}
                          title="Upload storyboard"
                        >
                          <UploadCloud className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Shot Details Modal */}
      {showShotModal && selectedShot && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-gray-800">
              <h3 className="text-lg font-bold text-white">Shot {selectedShot.id}</h3>
              <button onClick={handleCloseShotModal} className="text-gray-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="flex-grow overflow-y-auto p-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left column - Shot details */}
                <div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="text-gray-400 text-sm mb-1">Script Page #</div>
                      <div className="text-white">{selectedShot.scriptPage === 'Unknown' ? 'Unknown' : selectedShot.scriptPage}</div>
                    </div>
                    
                    <div>
                      <div className="text-gray-400 text-sm mb-1">Status</div>
                      <div className="inline-block px-2 py-1 rounded" style={{ backgroundColor: getStatusColor(selectedShot.status), color: 'white' }}>
                        {selectedShot.status}
                      </div>
                    </div>
                    
                    <div className="md:col-span-2">
                      <div className="text-gray-400 text-sm mb-1">Description</div>
                      <div className="text-white">{selectedShot.description}</div>
                    </div>
                    
                    <div className="md:col-span-2">
                      <div className="text-gray-400 text-sm mb-1">Last Updated</div>
                      <div className="text-white flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        {formatDate(selectedShot.lastUpdate)}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Right column - Storyboard */}
                <div>
                  <div className="text-gray-400 text-sm mb-2">Storyboard</div>
                  <div className="border border-gray-700 rounded-lg p-4 bg-gray-800">
                    {selectedShot.storyboard ? (
                      <div className="space-y-3">
                        <img
                          src={`${API_URL}/shots/${selectedShot.id}/storyboard`}
                          alt={`Storyboard for shot ${selectedShot.id}`}
                          className="w-full rounded cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => {
                            setCurrentSlideshot(selectedShot);
                            setShowSlideshow(true);
                          }}
                        />
                        <div className="flex gap-2">
                          <button
                            className="flex items-center gap-1 px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white text-sm"
                            onClick={() => {
                              setCurrentSlideshot(selectedShot);
                              setShowSlideshow(true);
                            }}
                          >
                            <Eye className="h-3 w-3" />
                            View Fullscreen
                          </button>
                          <button
                            className="flex items-center gap-1 px-3 py-1 rounded bg-red-600 hover:bg-red-700 text-white text-sm"
                            onClick={() => handleDeleteStoryboard(selectedShot.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                            Delete
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center text-gray-500 py-8">
                        <Film className="h-16 w-16 mx-auto mb-3 opacity-50" />
                        <p className="mb-3">No storyboard uploaded</p>
                        <button
                          className="flex items-center gap-1 px-3 py-2 rounded bg-purple-600 hover:bg-purple-700 text-white mx-auto"
                          onClick={() => {
                            setUploadingShotId(selectedShot.id);
                            setShowUploadModal(true);
                          }}
                        >
                          <UploadCloud className="h-4 w-4" />
                          Upload Storyboard
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end p-4 border-t border-gray-800">
              <button 
                className="flex items-center space-x-1 px-3 py-1 rounded"
                style={{ backgroundColor: colors.accent, color: 'white' }}
                onClick={handleCloseShotModal}
              >
                <span>Close</span>
              </button>
            </div>
          </div>
        </div>
      )}

      
{/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-gray-800">
              <h3 className="text-lg font-bold text-white">Upload Storyboard</h3>
              <button onClick={() => setShowUploadModal(false)} className="text-gray-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-4">
              <div 
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive
                    ? 'border-purple-500 bg-purple-900 bg-opacity-20'
                    : 'border-gray-600 hover:border-gray-500'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept="image/jpeg,image/png"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setSelectedFile(e.target.files[0]);
                    }
                  }}
                />
                
                {selectedFile ? (
                  <div className="space-y-3">
                    <div className="w-full max-w-48 mx-auto">
                      <img
                        src={URL.createObjectURL(selectedFile)}
                        alt="Preview"
                        className="w-full rounded object-contain"
                      />
                    </div>
                    <p className="text-white">{selectedFile.name}</p>
                    <p className="text-gray-400 text-sm">
                      {Math.round(selectedFile.size / 1024)} KB
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Upload className="h-16 w-16 mx-auto text-gray-400" />
                    <div>
                      <p className="text-white">Drop your storyboard here or click to browse</p>
                      <p className="text-gray-400 text-sm mt-1">JPG or PNG, max 20MB</p>
                    </div>
                    <button
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Browse Files
                    </button>
                  </div>
                )}
              </div>
              
              {error && (
                <div className="mt-4 p-3 bg-red-900 bg-opacity-30 border border-red-800 rounded text-red-100">
                  {error}
                </div>
              )}
            </div>
            
            <div className="flex justify-end gap-3 p-4 border-t border-gray-800">
              <button
                className="px-4 py-2 border border-gray-600 text-gray-400 rounded hover:bg-gray-800"
                onClick={() => setShowUploadModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded disabled:opacity-50"
                onClick={handleUpload}
                disabled={!selectedFile || uploading}
              >
                {uploading ? 'Uploading...' : 'Upload'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Slideshow Modal */}
      {showSlideshow && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50"
          onClick={() => setShowSlideshow(false)}
        >
          <div className="max-w-screen-xl max-h-screen-90 w-full relative">
            {/* Close button */}
            <button
              className="absolute top-4 right-4 z-10 text-white hover:text-gray-300 text-4xl"
              onClick={() => setShowSlideshow(false)}
            >
              ×
            </button>
            
            {/* Navigation arrows */}
            <button
              className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 text-white hover:text-gray-300 text-6xl"
              onClick={(e) => {
                e.stopPropagation();
                navigateSlideshow('prev');
              }}
            >
              ‹
            </button>
            
            <button
              className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 text-white hover:text-gray-300 text-6xl"
              onClick={(e) => {
                e.stopPropagation();
                navigateSlideshow('next');
              }}
            >
              ›
            </button>
            
            {/* Main image display */}
            <div 
              className="flex items-center justify-center h-full"
              onClick={(e) => e.stopPropagation()}
            >
              {currentSlideshot?.storyboard ? (
                <img
                  src={`${API_URL}/shots/${currentSlideshot.id}/storyboard`}
                  alt={`Storyboard for shot ${currentSlideshot.id}`}
                  className="max-w-full max-h-full object-contain"
                />
              ) : (
                <div className="text-center text-gray-400">
                  <Film className="h-32 w-32 mx-auto mb-4" />
                  <p className="text-xl">No storyboard for shot {currentSlideshot?.id}</p>
                </div>
              )}
            </div>
            
            {/* Shot information overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white p-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold">Shot {currentSlideshot?.id}</h3>
                  <p className="text-gray-300">{currentSlideshot?.description}</p>
                  <p className="text-sm text-gray-400">
                    Script Page: {currentSlideshot?.scriptPage || 'Unknown'}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-400">
                    {filteredAndSortedShots.findIndex(s => s.id === currentSlideshot?.id) + 1} / {filteredAndSortedShots.length}
                  </div>
                  <div 
                    className="inline-block mt-1 px-2 py-1 rounded text-xs"
                    style={{ backgroundColor: getStatusColor(currentSlideshot?.status) }}
                  >
                    {currentSlideshot?.status}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Keyboard shortcuts hint */}
            <div className="absolute top-4 left-4 text-white text-sm opacity-75">
              Use ← → keys to navigate • ESC to close
            </div>
          </div>
        </div>
      )}
      
      {/* Storyboard Slideshow Modal */}
      {showStoryboardSlideshow && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50"
          onClick={() => setShowStoryboardSlideshow(false)}
        >
          <div className="max-w-screen-2xl max-h-screen-90 w-full relative" style={{ aspectRatio: '2388/1668' }}>
            {/* Close button */}
            <button
              className="absolute top-4 right-4 z-10 text-white hover:text-gray-300 text-4xl"
              onClick={() => setShowStoryboardSlideshow(false)}
            >
              ×
            </button>
            
            {/* Navigation arrows */}
            <button
              className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 text-white hover:text-gray-300 text-6xl"
              onClick={(e) => {
                e.stopPropagation();
                navigateStoryboardSlideshow('prev');
              }}
            >
              ‹
            </button>
            
            <button
              className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 text-white hover:text-gray-300 text-6xl"
              onClick={(e) => {
                e.stopPropagation();
                navigateStoryboardSlideshow('next');
              }}
            >
              ›
            </button>
            
            {/* Main storyboard display */}
            <div 
              className="flex items-center justify-center h-full"
              onClick={(e) => e.stopPropagation()}
            >
              {(() => {
                const sortedShots = [...filteredAndSortedShots].sort((a, b) => {
                  if (!isNaN(a.id) && !isNaN(b.id)) {
                    return parseInt(a.id) - parseInt(b.id);
                  }
                  return a.id.localeCompare(b.id);
                });
                const currentShot = sortedShots[currentSlideIndex];
                
                if (currentShot?.storyboard) {
                  return (
                    <img
                      src={`${API_URL}/shots/${currentShot.id}/storyboard`}
                      alt={`Storyboard for shot ${currentShot.id}`}
                      className="max-w-full max-h-full object-contain"
                      style={{ aspectRatio: '2388/1668' }}
                    />
                  );
                } else {
                  return (
                    <div 
                      className="bg-gray-800 border-2 border-gray-600 border-dashed flex items-center justify-center"
                      style={{ 
                        width: '80%', 
                        height: '80%',
                        aspectRatio: '2388/1668'
                      }}
                    >
                      <div className="text-center text-gray-400">
                        <Film className="h-24 w-24 mx-auto mb-4 opacity-50" />
                        <p className="text-2xl mb-2">No Storyboard</p>
                        <p className="text-lg">Shot {currentShot?.id}</p>
                      </div>
                    </div>
                  );
                }
              })()}
            </div>
            
            {/* Shot information overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white p-4">
              {(() => {
                const sortedShots = [...filteredAndSortedShots].sort((a, b) => {
                  if (!isNaN(a.id) && !isNaN(b.id)) {
                    return parseInt(a.id) - parseInt(b.id);
                  }
                  return a.id.localeCompare(b.id);
                });
                const currentShot = sortedShots[currentSlideIndex];
                
                return (
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-2xl font-bold">Shot {currentShot?.id}</h3>
                      <p className="text-gray-300 text-lg">{currentShot?.description}</p>
                      <p className="text-sm text-gray-400">
                        Script Page: {currentShot?.scriptPage || 'Unknown'}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg text-gray-400 mb-2">
                        {currentSlideIndex + 1} / {sortedShots.length}
                      </div>
                      <div 
                        className="inline-block px-3 py-1 rounded text-lg font-semibold"
                        style={{ backgroundColor: getStatusColor(currentShot?.status) }}
                      >
                        {currentShot?.status}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
            
            {/* Keyboard shortcuts hint */}
            <div className="absolute top-4 left-4 text-white text-lg opacity-75">
              Use ← → keys to navigate • ESC to close
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShotList;