import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Configure axios defaults
axios.defaults.timeout = 10000;

// Helper function to handle API errors
const handleApiError = (error, defaultReturn = []) => {
  console.error('API Error:', error.message);
  
  if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED') {
    console.warn('Backend server seems to be down. Make sure to run: npm run dev in the backend folder');
  }
  
  return defaultReturn;
};

// TASKS API
export const fetchTasks = async () => {
  try {
    const response = await axios.get(`${API_URL}/tasks`);
    return response.data;
  } catch (error) {
    return handleApiError(error, []);
  }
};

export const addTask = async (task) => {
  try {
    const response = await axios.post(`${API_URL}/tasks`, task);
    return response.data;
  } catch (error) {
    return handleApiError(error, task);
  }
};

export const updateTask = async (id, task) => {
  try {
    const response = await axios.put(`${API_URL}/tasks/${id}`, task);
    return response.data;
  } catch (error) {
    return handleApiError(error, task);
  }
};

export const deleteTask = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/tasks/${id}`);
    return response.data;
  } catch (error) {
    return handleApiError(error, { message: "Task deleted successfully" });
  }
};

// Reorder tasks: orderedIds = array of task ids in the new desired sequence
export const reorderTasks = async (orderedIds) => {
  try {
    const response = await axios.put(`${API_URL}/tasks/reorder`, { orderedIds });
    return response.data;
  } catch (error) {
    return handleApiError(error, { updated: 0 });
  }
};

// NOTES API
export const fetchNotes = async () => {
  try {
    const response = await axios.get(`${API_URL}/notes`);
    return response.data;
  } catch (error) {
    return handleApiError(error, []);
  }
};

export const addNote = async (note) => {
  try {
    const response = await axios.post(`${API_URL}/notes`, note);
    return response.data;
  } catch (error) {
    return handleApiError(error, note);
  }
};

export const updateNote = async (id, note) => {
  try {
    const response = await axios.put(`${API_URL}/notes/${id}`, note);
    return response.data;
  } catch (error) {
    return handleApiError(error, note);
  }
};

export const deleteNote = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/notes/${id}`);
    return response.data;
  } catch (error) {
    return handleApiError(error, { message: "Note deleted successfully" });
  }
};

// MILESTONES API
export const fetchMilestones = async () => {
  try {
    const response = await axios.get(`${API_URL}/milestones`);
    return response.data;
  } catch (error) {
    return handleApiError(error, [
      { id: 1, name: 'Pre-Production', completed: false, active: true },
      { id: 2, name: 'Production', completed: false, active: false },
      { id: 3, name: 'Post-Production', completed: false, active: false }
    ]);
  }
};

export const updateMilestone = async (id) => {
  try {
    const response = await axios.put(`${API_URL}/milestones/${id}`, { active: true });
    return response.data;
  } catch (error) {
    return handleApiError(error, []);
  }
};

// IMAGES API
export const fetchImages = async () => {
  try {
    const response = await axios.get(`${API_URL}/images`);
    return response.data;
  } catch (error) {
    return handleApiError(error, []);
  }
};

export const uploadImage = async (file, uploadData) => {
  try {
    const formData = new FormData();
    formData.append('image', file);
    
    // FIXED: Map frontend data to server format
    formData.append('name', uploadData.name || 'Untitled');
    formData.append('x', uploadData.x || 100);
    formData.append('y', uploadData.y || 100);
    formData.append('width', uploadData.width || 300);
    formData.append('height', uploadData.height || 200);
    
    // Handle loreNoteIds array
    if (uploadData.loreNoteIds && Array.isArray(uploadData.loreNoteIds)) {
      formData.append('loreNoteIds', JSON.stringify(uploadData.loreNoteIds));
    }

    console.log('Uploading with data:', uploadData);
    
    const response = await axios.post(`${API_URL}/images/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
};

// FIXED: Update image with proper payload handling
export const updateImage = async (id, updateData) => {
  try {
    console.log('API: Updating image', id, 'with data:', updateData);
    
    const response = await axios.put(`${API_URL}/images/${id}`, updateData, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    console.log('API: Update successful:', response.data);
    return response.data;
  } catch (error) {
    console.error('API: Update failed:', error);
    throw error;
  }
};

export const updateImagePosition = async (id, position) => {
  try {
    console.log('API: Updating position for image', id, position);
    
    // FIXED: Send posX/posY format that Node.js server expects
    const response = await axios.put(`${API_URL}/images/${id}/position`, {
      posX: position.posX || position.x,  // Handle both formats
      posY: position.posY || position.y   // Handle both formats
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('API: Position update failed:', error);
    throw error;
  }
};

export const updateImageSize = async (id, size) => {
  try {
    const response = await axios.put(`${API_URL}/images/${id}/size`, size, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    return handleApiError(error, { message: "Size updated" });
  }
};

export const deleteImage = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/images/${id}`);
    return response.data;
  } catch (error) {
    return handleApiError(error, { message: "Image deleted successfully" });
  }
};

// SHOTS API
export const fetchShots = async () => {
  try {
    const response = await axios.get(`${API_URL}/shots`);
    return response.data;
  } catch (error) {
    return handleApiError(error, []);
  }
};

export const addShot = async (shot) => {
  try {
    const response = await axios.post(`${API_URL}/shots`, shot);
    return response.data;
  } catch (error) {
    return handleApiError(error, shot);
  }
};

export const updateShot = async (id, shot) => {
  try {
    const response = await axios.put(`${API_URL}/shots/${id}`, shot);
    return response.data;
  } catch (error) {
    return handleApiError(error, shot);
  }
};

export const deleteShot = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/shots/${id}`);
    return response.data;
  } catch (error) {
    return handleApiError(error, { message: "Shot deleted successfully" });
  }
};

// STORYBOARD API
export const uploadStoryboard = async (shotId, file) => {
  try {
    const formData = new FormData();
    formData.append('storyboard', file);
    
    const response = await axios.post(`${API_URL}/shots/${shotId}/storyboard`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Upload storyboard error:', error);
    throw error;
  }
};

export const fetchStoryboard = async (shotId) => {
  try {
    const response = await axios.get(`${API_URL}/shots/${shotId}/storyboard`);
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return null;
    }
    console.error('Fetch storyboard error:', error);
    throw error;
  }
};

export const deleteStoryboard = async (shotId) => {
  try {
    const response = await axios.delete(`${API_URL}/shots/${shotId}/storyboard`);
    return response.data;
  } catch (error) {
    console.error('Delete storyboard error:', error);
    throw error;
  }
};

// System status endpoint
export const fetchSystemStatus = async () => {
  try {
    const response = await axios.get(`${API_URL}/status`);
    return response.data;
  } catch (error) {
    return handleApiError(error, {
      storage: { total: 2000000000000, used: 800000000000, percentage: 40 },
      backup: { last_backup: new Date().toISOString(), status: 'OK' },
      render_cache: { total: 500000000000, used: 200000000000, percentage: 40 },
      system_time: new Date().toISOString(),
      uptime: 604800,
      cpu_usage: 25,
      memory_usage: { total: 16000000000, used: 8000000000, free: 8000000000 }
    });
  }
};

// Check server connection
export const checkServerConnection = async () => {
  try {
    console.log('Checking server connection at:', `${API_URL}/check-connection`);
    const response = await axios.get(`${API_URL}/check-connection`, { 
      timeout: 5000,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    console.log('Server connection response:', response.status, response.data);
    return response.status === 200 && response.data?.status === 'online';
  } catch (error) {
    console.warn('Backend server connection failed:', error.message);
    console.warn('Error details:', error.code, error.response?.status);
    return false;
  }
};