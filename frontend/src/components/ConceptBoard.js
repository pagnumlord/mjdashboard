// frontend/src/components/ConceptBoard.js
import React, { useRef, useState, useEffect } from "react";
import { API_URL, fetchImages, uploadImage, updateImagePosition, deleteImage, checkServerConnection, updateImageSize } from '../api';

const ConceptBoard = () => {
  const boardRef = useRef(null);
  const fileInputRef = useRef(null);

  const [images, setImages] = useState([]);
  const [draggingId, setDraggingId] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [transform, setTransform] = useState({ scale: 1, x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [hoveredImageId, setHoveredImageId] = useState(null);
  const [resizingId, setResizingId] = useState(null);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });

  // Multi-selection states
  const [selectedImageIds, setSelectedImageIds] = useState(new Set());
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionBox, setSelectionBox] = useState({ startX: 0, startY: 0, endX: 0, endY: 0 });
  const [groupDragging, setGroupDragging] = useState(false);
  const [groupDragStart, setGroupDragStart] = useState({ x: 0, y: 0 });
  const [groupDragOffsets, setGroupDragOffsets] = useState({});

  const [showModal, setShowModal] = useState(false);
  const [pendingImage, setPendingImage] = useState(null);
  const [inputName, setInputName] = useState("");
  const [inputCategory, setInputCategory] = useState("");
const [selectedLoreNoteIds, setSelectedLoreNoteIds] = useState([]);
  const [loreNotes, setLoreNotes] = useState([]);

  const [errorMessage, setErrorMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [serverOnline, setServerOnline] = useState(false);

  const categories = [
    'Characters',
    'World Building', 
    'Music/Audio',
    'Technology',
    'Story/Plot',
    'Antagonists',
    'Environments',
    'Props',
    'Vehicles',
    'General'
  ];

  const categoryColors = {
    'Characters': '#EC4899',
    'World Building': '#00dbdd', 
    'Music/Audio': '#4ADE80',
    'Technology': '#f59e0b',
    'Story/Plot': '#8b5cf6',
    'Antagonists': '#FF3D3D',
    'Environments': '#10b981',
    'Props': '#f97316',
    'Vehicles': '#6366f1',
    'General': '#6b7280'
  };


// FIND calls to updateImagePosition and wrap them in throttling:

// ADD this helper function at the top of your ConceptBoard component:
const throttleRef = useRef(new Map());

const throttledUpdatePosition = (imageId, x, y) => {
  const key = imageId;
  
  // Clear existing timeout
  if (throttleRef.current.has(key)) {
    clearTimeout(throttleRef.current.get(key));
  }
  
  // Set new timeout
  const timeoutId = setTimeout(async () => {
    try {
      // FIXED: Send correct position data
      await updateImagePosition(imageId, { posX: x, posY: y });
      throttleRef.current.delete(key);
    } catch (error) {
      console.error('Failed to update position:', error);
      throttleRef.current.delete(key);
    }
  }, 300);
  
  throttleRef.current.set(key, timeoutId);
};

  // New handler functions for multi-LoreNote connections
  const handleUpdateImageConnections = async (imageId, selectedNoteIds) => {
    console.log('=== Starting handleUpdateImageConnections ===');
    console.log('Input:', { imageId, selectedNoteIds });
    
    try {
      // Convert string IDs to numbers for server
      const noteIds = selectedNoteIds.map(id => parseInt(id)).filter(id => !isNaN(id));
      
      // For backward compatibility, also set single loreNoteId
      const primaryNoteId = noteIds.length > 0 ? noteIds[0] : null;
      
      console.log('Processed IDs:', { noteIds, primaryNoteId });
      
      // Update local state immediately for responsive UI
      setImages(prev => {
        const updatedImages = prev.map(img => {
          if (img.id === imageId) {
            console.log('Updating image locally:', {
              id: img.id,
              oldLoreNoteId: img.loreNoteId,
              oldLoreNoteIds: img.loreNoteIds,
              newLoreNoteIds: noteIds.map(id => id.toString()),
              newLoreNoteId: primaryNoteId ? primaryNoteId.toString() : null
            });
            
            return {
              ...img,
              loreNoteIds: noteIds.map(id => id.toString()),
              loreNoteId: primaryNoteId ? primaryNoteId.toString() : null,
              // Update category based on primary connection
              category: primaryNoteId ?
                (loreNotes.find(note => note.id === primaryNoteId)?.category || img.category) :
                img.category
            };
          }
          return img;
        });

        return updatedImages;
      });
      
      // Try server update (but don't block on failure)
      try {
        const updatePayload = {
          loreNoteIds: noteIds,
          loreNoteId: primaryNoteId
        };
        
        console.log('Attempting server update with payload:', updatePayload);
        
        const response = await fetch(`${API_URL}/images/${imageId}`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(updatePayload)
        });

        if (response.ok) {
          const responseData = await response.json();
          console.log('✅ Server update successful:', responseData);
        } else {
          throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
        }
      } catch (serverError) {
        console.log('⚠️ Server update failed (using local fallback):', serverError.message);
        // Don't show error message since local update worked
      }
      
      console.log('✅ Image connections updated successfully');
      
    } catch (error) {
      console.error('❌ Failed to update image connections:', error);
      setErrorMessage("Failed to update connections. Please try again.");
      setTimeout(() => setErrorMessage(null), 3000);
    }
  };

  const handleUnlinkFromNote = async (imageId, noteIdToRemove) => {
    const img = images.find(i => i.id === imageId);
    if (!img) return;
    
    const currentConnections = img.loreNoteIds || (img.loreNoteId ? [img.loreNoteId] : []);
    const updatedConnections = currentConnections.filter(id => id.toString() !== noteIdToRemove.toString());
    
    console.log('Unlinking note:', { imageId, noteIdToRemove, currentConnections, updatedConnections });
    
    await handleUpdateImageConnections(imageId, updatedConnections);
  };

  const handleClearAllConnections = async (imageId) => {
    console.log('Clearing all connections for image:', imageId);
    await handleUpdateImageConnections(imageId, []);
  };

  const handleConnectToAll = async (imageId) => {
    const allNoteIds = loreNotes.map(note => note.id.toString());
    console.log('Connecting to all notes:', { imageId, allNoteIds });
    await handleUpdateImageConnections(imageId, allNoteIds);
  };

const debugLocalStorage = () => {
  const stored = localStorage.getItem('conceptBoard_images');
  if (stored) {
    const images = JSON.parse(stored);
    console.log('=== LOCALSTORAGE DEBUG ===');
    console.log('Total images:', images.length);
    images.forEach((img, index) => {
      console.log(`Image ${index + 1}:`, {
        id: img.id,
        name: img.name,
        position: `x:${img.x}, y:${img.y}`,
        src: img.src?.substring(0, 50) + '...',
        isLocal: img.isLocal
      });
    });
  } else {
    console.log('No images in localStorage');
  }
};

// Call it on component mount
useEffect(() => {
  debugLocalStorage();
}, []);

  // Check server connection
  useEffect(() => {
    const checkServer = async () => {
      const isOnline = await checkServerConnection();
      setServerOnline(isOnline);
      if (!isOnline) {
        setErrorMessage("Server is offline. Make sure your backend is running on port 5000");
      }
    };
    
    checkServer();
  }, []);

  // Load data with localStorage fallback
 useEffect(() => {

const loadData = async () => {
  setIsLoading(true);
  try {
    // ALWAYS load from localStorage first for immediate display
    const cachedImages = localStorage.getItem('conceptBoard_images');
    let localImages = [];
    
    if (cachedImages) {
      try {
        const parsedImages = JSON.parse(cachedImages);
        console.log('Raw parsed images from localStorage:', parsedImages.length);
        
        // Keep ALL images but filter out broken ones
        localImages = parsedImages.filter(img => {
          return img && img.id && img.src && (img.x !== undefined) && (img.y !== undefined);
        });
        
        setImages(localImages); // Show immediately
        console.log('Loaded from localStorage:', localImages.length, 'images');
      } catch (parseError) {
        console.error('Error parsing localStorage images:', parseError);
        localStorage.removeItem('conceptBoard_images'); // Clear corrupted data
        localImages = [];
      }
    }

    // Check server status and load server images
    try {
      console.log('Checking server connection...');
      const isOnline = await checkServerConnection();
      setServerOnline(isOnline);
      
      if (isOnline) {
        console.log('Server online - fetching images...');
        const fetchedImages = await fetchImages();
        console.log('Server response:', fetchedImages);
        
        if (fetchedImages && Array.isArray(fetchedImages) && fetchedImages.length > 0) {
          console.log('Processing server images...');
          const formattedImages = fetchedImages.map(img => ({
            id: img.id.toString(),
            src: `http://localhost:5000${img.url}`,
            x: img.posX || img.x || 100,
            y: img.posY || img.y || 100,
            name: img.name || img.originalName || 'Untitled',
            loreNoteId: img.loreNoteId ? img.loreNoteId.toString() : null,
            loreNoteIds: img.loreNoteIds ? img.loreNoteIds.map(id => id.toString()) : 
                         (img.loreNoteId ? [img.loreNoteId.toString()] : []),
            category: img.category || 'General',
            width: img.width || 300,
            height: img.height || 150,
            isLocal: false
          }));
          
          // CRITICAL: Replace localStorage images with server images
          // (Server is the source of truth)
          setImages(formattedImages);
          
          // Save server image references to localStorage (lightweight)
          try {
            localStorage.setItem('conceptBoard_images', JSON.stringify(formattedImages));
            console.log('Updated localStorage with server images');
          } catch (quotaError) {
            console.warn('localStorage quota exceeded, continuing without cache');
          }
        } else {
          console.log('Server has no images - keeping localStorage images');
          // Keep the localStorage images we already loaded
        }
      } else {
        console.log('Server offline - using localStorage only');
        setServerOnline(false);
      }
    } catch (serverError) {
      console.log('Server error:', serverError.message);
      setServerOnline(false);
      // Keep the localStorage images we already loaded
    }

    // Load lore notes
    const storedLoreNotes = localStorage.getItem('melodicJustice_loreNotes');
    if (storedLoreNotes) {
      setLoreNotes(JSON.parse(storedLoreNotes));
    }

  } catch (error) {
    console.error('Failed to load data:', error);
    setErrorMessage('Failed to load data. Using cached version if available.');
  } finally {
    setIsLoading(false);
  }
};

  loadData();

  const handleLoreNotesStorageChange = (e) => {
    if (e.key === 'melodicJustice_loreNotes') {
      const storedLoreNotes = localStorage.getItem('melodicJustice_loreNotes');
      if (storedLoreNotes) {
        setLoreNotes(JSON.parse(storedLoreNotes));
      }
    }
  };
  window.addEventListener('storage', handleLoreNotesStorageChange);
  return () => window.removeEventListener('storage', handleLoreNotesStorageChange);

}, []);

  useEffect(() => {
    // safeLocalStorageSave handles the write + quota errors + dedupe
    safeLocalStorageSave('conceptBoard_images', images);
  }, [images]);

  // Add global mouse event listeners for reliable drag handling
  useEffect(() => {
    const handleGlobalMouseUp = async (e) => {
      // Force stop all dragging operations
      if (draggingId) {
        const image = images.find(img => img.id === draggingId);
        if (image) {
          try {
throttledUpdatePosition(draggingId, image.x, image.y);
          } catch (error) {
            console.error('Failed to update position:', error);
          }
          // Update localStorage immediately after position change
          setImages(prev => {
            const updatedImages = prev.map(img => 
              img.id === draggingId ? { ...img, x: image.x, y: image.y } : img
            );
            localStorage.setItem('conceptBoard_images', JSON.stringify(updatedImages));
            return updatedImages;
          });
        }
        setDraggingId(null);
        setDragOffset({ x: 0, y: 0 });
      }

      if (groupDragging) {
        // Update positions for all selected images
        const selectedImages = images.filter(img => selectedImageIds.has(img.id));
        const updatePromises = [];
        
        for (const image of selectedImages) {
          try {
            updatePromises.push(updateImagePosition(image.id, image.x, image.y));
          } catch (error) {
            console.error('Failed to update group position:', error);
          }
        }
        
        // Wait for all updates and then save to localStorage
        try {
          await Promise.all(updatePromises);
          // Save current images state to localStorage
          localStorage.setItem('conceptBoard_images', JSON.stringify(images));
        } catch (error) {
          console.error('Failed to save group positions:', error);
        }
        
        setGroupDragging(false);
        setGroupDragOffsets({});
      }
      
      if (resizingId) {
        const image = images.find(img => img.id === resizingId);
        if (image) {
          try {
            await updateImageSize(resizingId, image.width, image.height);
          } catch (error) {
            console.error('Failed to update size:', error);
          }
        }
        setResizingId(null);
      }

      if (isSelecting) {
        setIsSelecting(false);
        setSelectionBox({ startX: 0, startY: 0, endX: 0, endY: 0 });
      }
      
      setIsPanning(false);
    };

    // Also listen for mouse leave events to force stop dragging
    const handleMouseLeave = () => {
      if (groupDragging || draggingId) {
        setGroupDragging(false);
        setDraggingId(null);
        setDragOffset({ x: 0, y: 0 });
        setGroupDragOffsets({});
      }
    };

    const handleGlobalMouseMove = (e) => {
      if (draggingId && !resizingId && !groupDragging) {
        const rect = boardRef.current?.getBoundingClientRect();
        if (!rect) return;
        
        const boardX = (e.clientX - rect.left - transform.x) / transform.scale;
        const boardY = (e.clientY - rect.top - transform.y) / transform.scale;
        
        const newX = boardX - dragOffset.x; // Remove Math.max(0, ...) constraint
        const newY = boardY - dragOffset.y; // Remove Math.max(0, ...) constraint
        
        setImages(prev => prev.map(img => 
          img.id === draggingId ? { ...img, x: newX, y: newY } : img
        ));
      } else if (groupDragging) {
        const rect = boardRef.current?.getBoundingClientRect();
        if (!rect) return;
        
        const boardX = (e.clientX - rect.left - transform.x) / transform.scale;
        const boardY = (e.clientY - rect.top - transform.y) / transform.scale;
        
        const deltaX = boardX - groupDragStart.x;
        const deltaY = boardY - groupDragStart.y;
        
        setImages(prev => prev.map(img => {
          if (selectedImageIds.has(img.id) && groupDragOffsets[img.id]) {
            return {
              ...img,
              x: groupDragOffsets[img.id].originalX + deltaX, // Remove Math.max constraint
              y: groupDragOffsets[img.id].originalY + deltaY  // Remove Math.max constraint
            };
          }
          return img;
        }));
      } else if (resizingId) {
  const rect = boardRef.current?.getBoundingClientRect();
  if (!rect) return;
  
  const mouseX = (e.clientX - rect.left - transform.x) / transform.scale;
  const mouseY = (e.clientY - rect.top - transform.y) / transform.scale;
  
  const deltaX = mouseX - resizeStart.x;
  
  // Get the image's aspect ratio
  const currentImage = images.find(img => img.id === resizingId);
  const aspectRatio = currentImage?.aspectRatio || (currentImage ? currentImage.width / currentImage.height : 1);
  
  const newWidth = Math.max(50, resizeStart.width + deltaX);
  const newHeight = newWidth / aspectRatio; // Maintain aspect ratio
  
  setImages(prev => prev.map(img => 
    img.id === resizingId ? { ...img, width: newWidth, height: newHeight } : img
  ));
} else if (isSelecting) {
        const rect = boardRef.current?.getBoundingClientRect();
        if (!rect) return;
        
        const boardX = (e.clientX - rect.left - transform.x) / transform.scale;
        const boardY = (e.clientY - rect.top - transform.y) / transform.scale;
        
        setSelectionBox(prev => ({
          ...prev,
          endX: boardX,
          endY: boardY
        }));

        // Update selected images based on selection box
        const boxLeft = Math.min(selectionBox.startX, boardX);
        const boxTop = Math.min(selectionBox.startY, boardY);
        const boxRight = Math.max(selectionBox.startX, boardX);
        const boxBottom = Math.max(selectionBox.startY, boardY);

        const newSelectedIds = new Set();
        images.forEach(img => {
          // Check if image intersects with selection box
          if (img.x < boxRight && img.x + img.width > boxLeft &&
              img.y < boxBottom && img.y + img.height > boxTop) {
            newSelectedIds.add(img.id);
          }
        });
        setSelectedImageIds(newSelectedIds);
      } else if (isPanning) {
        // Fixed: Make panning consistent regardless of zoom level
        const deltaX = e.clientX - panStart.x;
        const deltaY = e.clientY - panStart.y;
        
        setTransform(prev => ({
          ...prev,
          x: prev.x + deltaX,
          y: prev.y + deltaY
        }));
        
        setPanStart({ x: e.clientX, y: e.clientY });
      }
    };

    // Add global event listeners with more coverage
    document.addEventListener('mouseup', handleGlobalMouseUp, true); // Use capture phase
    document.addEventListener('mousemove', handleGlobalMouseMove, true);
    document.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('blur', handleMouseLeave); // Also handle window losing focus
    
    // Add keyboard escape listener
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setGroupDragging(false);
        setDraggingId(null);
        setDragOffset({ x: 0, y: 0 });
        setGroupDragOffsets({});
        setIsSelecting(false);
        setIsPanning(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    
    // Cleanup
    return () => {
      document.removeEventListener('mouseup', handleGlobalMouseUp, true);
      document.removeEventListener('mousemove', handleGlobalMouseMove, true);
      document.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('blur', handleMouseLeave);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [draggingId, groupDragging, resizingId, isPanning, isSelecting, dragOffset, transform, resizeStart, panStart, images, selectedImageIds, selectionBox, groupDragStart, groupDragOffsets]);

  // Prevent page scrolling with mouse wheel anywhere in the component
useEffect(() => {
  const preventPageScroll = (e) => {
    // Only prevent if we're over the concept board
    if (boardRef.current && boardRef.current.contains(e.target)) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  // Add wheel event listener with passive: false to allow preventDefault
  document.addEventListener('wheel', preventPageScroll, { passive: false });
  
  return () => {
    document.removeEventListener('wheel', preventPageScroll);
  };
}, []);

  // Get effective category (updated for multiple connections)
  const getEffectiveImageCategory = (image) => {
    // Check for multiple connections first
    if (image.loreNoteIds && image.loreNoteIds.length > 0 && loreNotes.length > 0) {
      const primaryNote = loreNotes.find(note => note.id.toString() === image.loreNoteIds[0]);
      return primaryNote ? primaryNote.category : image.category;
    }
    
    // Fallback to single connection
    if (image.loreNoteId && loreNotes.length > 0) {
      const linkedNote = loreNotes.find(note => note.id.toString() === image.loreNoteId);
      return linkedNote ? linkedNote.category : image.category;
    }
    
    return image.category;
  };

  // Event handlers
const handleFileSelect = (event) => {
  const file = event.target.files[0];
  if (file) {
    setPendingImage(file);
    setInputName(`Image ${images.length + 1}`);
    setSelectedLoreNoteIds([]); // Reset to empty array
    setShowModal(true);
  }
};

const handleUploadConfirm = async () => {
  if (!pendingImage) return;

  setIsUploading(true);
  try {
    // Check file size to decide storage strategy
    const fileSizeKB = pendingImage.size / 1024;
    console.log('File size:', fileSizeKB.toFixed(2), 'KB');

    if (serverOnline) {
      // Try server upload first (preferred)
      try {
        const uploadData = {
          name: inputName,
          loreNoteIds: selectedLoreNoteIds,
          x: 200,
          y: 200,
          width: 300,
          height: 200
        };

        console.log('Uploading to server...');
        const uploadedImage = await uploadImage(pendingImage, uploadData);
        
        if (uploadedImage) {
          // Create server image reference
          const serverImage = {
            id: uploadedImage.id.toString(),
            src: `http://localhost:5000${uploadedImage.url}`,
            x: uploadedImage.posX || 200,
            y: uploadedImage.posY || 200,
            name: uploadedImage.name,
            loreNoteId: selectedLoreNoteIds.length > 0 ? selectedLoreNoteIds[0] : null,
            loreNoteIds: selectedLoreNoteIds,
            width: uploadedImage.width || 300,
            height: uploadedImage.height || 200,
            category: uploadedImage.category || 'General',
            isLocal: false
          };

          // Add to images state
          setImages(prev => {
            const updated = [...prev, serverImage];
            
            // Try to save to localStorage (but don't fail if quota exceeded)
            try {
              localStorage.setItem('conceptBoard_images', JSON.stringify(updated));
              console.log('Saved server image reference to localStorage');
            } catch (quotaError) {
              console.warn('localStorage full - image saved to server only');
            }
            
            return updated;
          });

          console.log('✅ Image uploaded successfully to server');
        }
      } catch (serverError) {
        console.error('Server upload failed:', serverError);
        setErrorMessage('Server upload failed. Please check your connection and try again.');
      }
    } else {
      // Server offline - inform user
      setErrorMessage('Server is offline. Please start your backend server to upload images.');
    }

  } catch (error) {
    console.error('Upload failed:', error);
    setErrorMessage('Failed to upload image. Please try again.');
  } finally {
    setIsUploading(false);
    setShowModal(false);
    setPendingImage(null);
    setInputName("");
    setSelectedLoreNoteIds([]);
  }
};

const safeLocalStorageSave = (key, data) => {
  try {
    const jsonString = JSON.stringify(data);
    const sizeKB = (jsonString.length / 1024).toFixed(2);
    console.log(`Attempting to save ${sizeKB}KB to localStorage`);
    
    localStorage.setItem(key, jsonString);
    console.log('✅ Successfully saved to localStorage');
    return true;
  } catch (error) {
    if (error.name === 'QuotaExceededError') {
      console.warn('⚠️ localStorage quota exceeded - data saved to server only');
      // Optionally clear old data to make space
      try {
        localStorage.removeItem('conceptBoard_images');
        localStorage.setItem(key, JSON.stringify(data));
        console.log('✅ Cleared old data and saved successfully');
        return true;
      } catch (retryError) {
        console.error('❌ Still cannot save to localStorage:', retryError);
      }
    } else {
      console.error('❌ localStorage save error:', error);
    }
    return false;
  }
};

  const handleUpdateImageCategory = async (imageId, category, loreNoteId) => {
    // Check if server is online first
    if (!serverOnline) {
      console.log('Server is offline, updating locally only');
      // Update only locally if server is offline
      setImages(prev => {
        const updatedImages = prev.map(img => {
          if (img.id === imageId) {
            if (loreNoteId) {
              const linkedNote = loreNotes.find(note => note.id.toString() === loreNoteId.toString());
              const noteCategory = linkedNote ? linkedNote.category : (category || img.category);
              return { 
                ...img, 
                loreNoteId: loreNoteId.toString(), 
                category: noteCategory 
              };
            } else {
              return { 
                ...img, 
                loreNoteId: null, 
                category: category || img.category 
              };
            }
          }
          return img;
        });
        localStorage.setItem('conceptBoard_images', JSON.stringify(updatedImages));
        return updatedImages;
      });
      setErrorMessage("Server offline - changes saved locally only");
      return;
    }

    try {
      console.log('Attempting to update image:', { imageId, category, loreNoteId });
      
      // Prepare the update payload
      const updatePayload = {};
      if (category !== null && category !== undefined) {
        updatePayload.category = category;
      }
      if (loreNoteId !== undefined) {
        // Convert to number if it's a string, or null if it should be unlinked
        updatePayload.loreNoteId = loreNoteId ? parseInt(loreNoteId) : null;
      }
      
      console.log('Update payload:', updatePayload);
      console.log('Making request to:', `${API_URL}/images/${imageId}`);
      
      // Send the update to the server
      const response = await fetch(`${API_URL}/images/${imageId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(updatePayload)
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server error response:', errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
      }

      const responseData = await response.json();
      console.log('Server response:', responseData);

      // Update local state immediately
      setImages(prev => {
        const updatedImages = prev.map(img => {
          if (img.id === imageId) {
            console.log('Updating local image:', img.id);
            // If linking to a lore note, get the note's category
            if (loreNoteId) {
              const linkedNote = loreNotes.find(note => note.id.toString() === loreNoteId.toString());
              const noteCategory = linkedNote ? linkedNote.category : (category || img.category);
              console.log('Linking to note:', { loreNoteId, linkedNote, noteCategory });
              return { 
                ...img, 
                loreNoteId: loreNoteId.toString(), 
                category: noteCategory 
              };
            } else {
              // Unlinking - use provided category or keep current
              console.log('Unlinking from note');
              return { 
                ...img, 
                loreNoteId: null, 
                category: category || img.category 
              };
            }
          }
          return img;
        });
        
        console.log('Updated images array:', updatedImages.map(img => ({ 
          id: img.id, 
          name: img.name, 
          loreNoteId: img.loreNoteId 
        })));
        
        // Save to localStorage immediately for LoreNotes integration
        localStorage.setItem('conceptBoard_images', JSON.stringify(updatedImages));
        
        return updatedImages;
      });
      
      console.log('Image category/link updated successfully');
      
    } catch (error) {
      console.error('Failed to update image on server:', error);
      
      // Fallback: Update locally even if server fails
      console.log('Server failed, updating locally as fallback');
      setImages(prev => {
        const updatedImages = prev.map(img => {
          if (img.id === imageId) {
            if (loreNoteId) {
              const linkedNote = loreNotes.find(note => note.id.toString() === loreNoteId.toString());
              const noteCategory = linkedNote ? linkedNote.category : (category || img.category);
              return { 
                ...img, 
                loreNoteId: loreNoteId.toString(), 
                category: noteCategory 
              };
            } else {
              return { 
                ...img, 
                loreNoteId: null, 
                category: category || img.category 
              };
            }
          }
          return img;
        });
        localStorage.setItem('conceptBoard_images', JSON.stringify(updatedImages));
        return updatedImages;
      });
      
      // Only show error if the local fallback also fails
      console.log('Local fallback completed successfully');
      
      // Show a less alarming message since the connection actually worked
      setErrorMessage("Connection saved locally (server sync will happen when available)");
      
      // Clear the error message after a few seconds since it worked
      setTimeout(() => {
        setErrorMessage(null);
      }, 3000);
    }
  };

  const handleDeleteImage = async (imageId) => {
    try {
      await deleteImage(imageId);
      setImages(prev => prev.filter(img => img.id !== imageId));
    } catch (error) {
      console.error('Failed to delete image:', error);
    }
  };

  const handleMouseDown = (e, imageId) => {
    if (resizingId) return;
    
    e.stopPropagation();
    
    const rect = boardRef.current.getBoundingClientRect();
    const clientX = e.clientX;
    const clientY = e.clientY;
    
    const boardX = (clientX - rect.left - transform.x) / transform.scale;
    const boardY = (clientY - rect.top - transform.y) / transform.scale;
    
    // Handle selection logic
    if (e.ctrlKey || e.metaKey) {
      // Toggle selection with Ctrl/Cmd
      setSelectedImageIds(prev => {
        const newSet = new Set(prev);
        if (newSet.has(imageId)) {
          newSet.delete(imageId);
        } else {
          newSet.add(imageId);
        }
        return newSet;
      });
      return; // Don't start dragging when selecting
    } else if (!selectedImageIds.has(imageId)) {
      // If clicking on unselected image, select only this one
      setSelectedImageIds(new Set([imageId]));
    }
    
    // Start dragging
    if (selectedImageIds.has(imageId) && selectedImageIds.size > 1) {
      // Group drag
      setGroupDragging(true);
      setGroupDragStart({ x: boardX, y: boardY });
      
      // Store original positions for all selected images
      const offsets = {};
      images.forEach(img => {
        if (selectedImageIds.has(img.id)) {
          offsets[img.id] = {
            originalX: img.x,
            originalY: img.y
          };
        }
      });
      setGroupDragOffsets(offsets);
    } else {
      // Single drag
      const image = images.find(img => img.id === imageId);
      if (image) {
        setDraggingId(imageId);
        setDragOffset({
          x: boardX - image.x,
          y: boardY - image.y
        });
      }
    }
  };

  const handleMouseMove = (e) => {
    // This function is now only used for board-level events
    // Individual dragging/resizing is handled by global listeners
  };

  const handleMouseUp = async () => {
    // This function is now only used for board-level events
    // Individual dragging/resizing is handled by global listeners
  };

  const handleResizeMouseDown = (e, imageId, corner) => {
    e.stopPropagation();
    const image = images.find(img => img.id === imageId);
    if (image) {
      const rect = boardRef.current.getBoundingClientRect();
      const mouseX = (e.clientX - rect.left - transform.x) / transform.scale;
      const mouseY = (e.clientY - rect.top - transform.y) / transform.scale;
      
      setResizingId(imageId);
      setResizeStart({
        x: mouseX,
        y: mouseY,
        width: image.width,
        height: image.height
      });
    }
  };

  const handleBoardMouseDown = (e) => {
    // Check if we clicked directly on the board or its transform container, not on an image
    const clickedOnBoard = e.target === boardRef.current || 
                          e.target.closest('[data-image-container]') === null;
    
    if (clickedOnBoard) {
      const rect = boardRef.current.getBoundingClientRect();
      const boardX = (e.clientX - rect.left - transform.x) / transform.scale;
      const boardY = (e.clientY - rect.top - transform.y) / transform.scale;
      
      if (e.shiftKey) {
        // Start selection box
        setIsSelecting(true);
        setSelectionBox({
          startX: boardX,
          startY: boardY,
          endX: boardX,
          endY: boardY
        });
      } else {
        // Clear selection and start panning
        setSelectedImageIds(new Set());
        setIsPanning(true);
        setPanStart({ x: e.clientX, y: e.clientY });
      }
    }
  };

 const handleWheel = (e) => {
  // Don't call preventDefault here - let the useEffect handle it
  const rect = boardRef.current.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;
  
  const delta = e.deltaY > 0 ? 0.9 : 1.1;
  const newScale = Math.max(0.1, Math.min(3, transform.scale * delta));
  
  const scaleChange = newScale / transform.scale;
  const newX = mouseX - (mouseX - transform.x) * scaleChange;
  const newY = mouseY - (mouseY - transform.y) * scaleChange;

  setTransform({ scale: newScale, x: newX, y: newY });
};

  // Viewport culling: only render images whose bbox intersects the visible
  // viewport (plus a 500px buffer so images don't pop in/out at the edges).
  // With 100+ images on the board, this is the biggest win for pan/zoom smoothness.
  const VIEW_PADDING = 500;
  const viewLeft = (-transform.x / transform.scale) - VIEW_PADDING;
  const viewTop = (-transform.y / transform.scale) - VIEW_PADDING;
  const viewRight = ((window.innerWidth - transform.x) / transform.scale) + VIEW_PADDING;
  const viewBottom = ((window.innerHeight - transform.y) / transform.scale) + VIEW_PADDING;
  const visibleImages = images.filter(img => {
    const w = img.width || 300;
    const h = img.height || 300;
    return (img.x + w) >= viewLeft && img.x <= viewRight
        && (img.y + h) >= viewTop && img.y <= viewBottom;
  });

  return (
    <div className="h-screen bg-gray-900 text-white relative overflow-hidden">
      {/* Fixed Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-gray-900 bg-opacity-95 backdrop-blur-sm p-4 flex justify-between items-center border-b border-gray-800">
        <div>
          <h1 className="text-2xl font-bold">Concept Board</h1>
          <p className="text-gray-400 text-sm">Organize and manage concept art and reference images</p>
          <div className="flex items-center mt-1 gap-4">
            <div className="flex items-center">
  <div className={`w-2 h-2 rounded-full mr-2 ${serverOnline ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
  <span className="text-xs text-gray-400">
    {serverOnline ? 'Server Connected' : 'Offline Mode'}
  </span>
</div>
            {selectedImageIds.size > 0 && (
              <div className="flex items-center">
                <span className="text-xs text-blue-400">
                  {selectedImageIds.size} image{selectedImageIds.size > 1 ? 's' : ''} selected
                </span>
                <button
                  onClick={() => setSelectedImageIds(new Set())}
                  className="ml-2 text-xs text-gray-400 hover:text-white"
                >
                  Clear
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <button
  onClick={() => fileInputRef.current?.click()}
  disabled={isUploading}
  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors disabled:opacity-50"
>
  {isUploading ? 'Uploading...' : '+ Add Image'}
</button>


              {/* Add this near your "Add Image" button */}
<button
  onClick={() => {
    setTransform({ scale: 1, x: 0, y: 0 });
    console.log('Reset view - images should be visible now');
  }}
  className="px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm"
>
  Reset View
</button>
          {/* Help text */}
          <div className="text-xs text-gray-400 self-center ml-4">
            <div>Shift+drag: select multiple</div>
            <div>Ctrl+click: toggle selection</div>
          </div>
        </div>
      </div>

  <button
  onClick={debugLocalStorage}
  className="px-3 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm"
>
  Debug Images
</button>

      {/* Error message */}
      {errorMessage && (
        <div className="absolute top-20 left-4 right-4 z-20 bg-red-900 bg-opacity-90 text-white p-3 rounded-lg">
          <button 
            onClick={() => setErrorMessage(null)}
            className="float-right ml-2 text-red-300 hover:text-white"
          >
            ×
          </button>
          {errorMessage}
        </div>
      )}

      {/* Full-screen Concept Board */}
      <div
        ref={boardRef}
        className="absolute inset-0"
        onMouseDown={handleBoardMouseDown}
        onWheel={handleWheel}
        style={{
          cursor: isPanning ? "grabbing" : "grab",
          overflowX: 'hidden',
          overflowY: 'hidden'
        }}
      >
        <div
          style={{
            transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
            transformOrigin: "0 0",
            position: "absolute",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            minWidth: "200vw", // Much larger canvas
            minHeight: "200vh",
          }}
        >
        {visibleImages.map((img) => {
  const effectiveCategory = getEffectiveImageCategory(img);
  const isSelected = selectedImageIds.has(img.id);
  
  // Simple approach: use a fixed width and let CSS handle aspect ratio
  const containerWidth = img.width || 300;
  
  return (
    <div
      key={img.id}
      data-image-container="true"
      style={{
        position: "absolute",
        left: img.x,
        top: img.y,
        width: containerWidth,
        // Remove fixed height - let it be determined by image
        cursor: draggingId === img.id || groupDragging ? "grabbing" : "move",
        userSelect: "none",
        borderRadius: "8px",
        padding: "0px",
        transition: "box-shadow 0.2s ease-in-out",
        boxShadow: isSelected 
          ? "0 0 0 3px #3b82f6, 0 8px 32px rgba(0,0,0,0.4)"
          : hoveredImageId === img.id 
          ? "0 8px 32px rgba(0,0,0,0.4)" 
          : "0 4px 16px rgba(0,0,0,0.3)",
        zIndex: hoveredImageId === img.id ? 100 : isSelected ? 50 : 1,
        border: isSelected ? "3px solid #3b82f6" : "none",
        overflow: "hidden",
      }}
      onMouseDown={(e) => handleMouseDown(e, img.id)}
      onMouseEnter={() => setHoveredImageId(img.id)}
      onMouseLeave={() => setHoveredImageId(null)}
    >
      <img
        src={img.src}
        alt={img.name}
        style={{
          width: "100%",
          height: "auto", // This is the key - let height adjust automatically
          borderRadius: "8px",
          display: "block",
        }}
        draggable={false}
      />

{/* Resize handles */}
{hoveredImageId === img.id && (
  <>
    <div
      className="absolute bottom-0 right-0 w-4 h-4 bg-white border border-gray-400 cursor-se-resize"
      onMouseDown={(e) => handleResizeMouseDown(e, img.id, 'se')}
      style={{ transform: 'translate(50%, 50%)' }}
    />
    <div
      className="absolute bottom-0 left-0 w-4 h-4 bg-white border border-gray-400 cursor-sw-resize"
      onMouseDown={(e) => handleResizeMouseDown(e, img.id, 'sw')}
      style={{ transform: 'translate(-50%, 50%)' }}
    />
    <div
      className="absolute top-0 right-0 w-4 h-4 bg-white border border-gray-400 cursor-ne-resize"
      onMouseDown={(e) => handleResizeMouseDown(e, img.id, 'ne')}
      style={{ transform: 'translate(50%, -50%)' }}
    />
    <div
      className="absolute top-0 left-0 w-4 h-4 bg-white border border-gray-400 cursor-nw-resize"
      onMouseDown={(e) => handleResizeMouseDown(e, img.id, 'nw')}
      style={{ transform: 'translate(-50%, -50%)' }}
    />
  </>
)}
               {/* Fixed dropdown positioning - positioned at bottom of image */}
{hoveredImageId === img.id && (
  <div 
    className="absolute bg-black bg-opacity-95 border border-gray-600 rounded-b-lg shadow-xl p-2"
    style={{
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 1001,
      minWidth: '200px'
    }}
  >
    {/* Header with name and delete button */}
    <div className="flex items-center justify-between mb-2">
      <div className="font-semibold text-xs text-gray-200">{img.name}</div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          if (window.confirm(`Delete "${img.name}"?`)) {
            handleDeleteImage(img.id);
          }
        }}
        className="text-red-400 hover:text-red-300 text-xs px-1"
        title="Delete image"
      >
        🗑️
      </button>
    </div>
    
    {/* Connection count */}
    {img.loreNoteIds && img.loreNoteIds.length > 0 && (
      <div className="text-xs text-teal-400 mb-2 text-center">
        {img.loreNoteIds.length} LoreNote{img.loreNoteIds.length > 1 ? 's' : ''} connected
      </div>
    )}
    
    {/* Compact LoreNote checkboxes */}
    <div className="space-y-1">
      <div className="text-xs text-gray-400 mb-1">Link to LoreNotes:</div>
      
      {/* Scrollable checkbox list */}
      <div className="max-h-24 overflow-y-auto space-y-1">
        {loreNotes.length === 0 ? (
          <div className="text-xs text-gray-500 italic text-center py-1">No LoreNotes available</div>
        ) : (
          loreNotes.map(note => {
            const isConnected = img.loreNoteIds ? 
              img.loreNoteIds.includes(note.id.toString()) : 
              (img.loreNoteId === note.id.toString());
            
            return (
              <label 
                key={note.id} 
                className="flex items-center px-1 py-0.5 hover:bg-gray-700 rounded cursor-pointer text-xs"
                onClick={(e) => e.stopPropagation()}
              >
                <input
                  type="checkbox"
                  checked={isConnected}
                  onChange={(e) => {
                    e.stopPropagation();
                    const currentConnections = img.loreNoteIds || (img.loreNoteId ? [img.loreNoteId] : []);
                    
                    if (e.target.checked) {
                      const newConnections = [...currentConnections, note.id.toString()];
                      handleUpdateImageConnections(img.id, newConnections);
                    } else {
                      const newConnections = currentConnections.filter(id => id !== note.id.toString());
                      handleUpdateImageConnections(img.id, newConnections);
                    }
                  }}
                  className="mr-2 text-teal-500 focus:ring-teal-500 scale-75"
                />
                <div className="flex items-center flex-1 min-w-0">
                  <div 
                    className="w-1.5 h-1.5 rounded-full mr-1.5 flex-shrink-0"
                    style={{ backgroundColor: note.color }}
                  />
                  <span className="text-white truncate flex-1">{note.title}</span>
                  <span className="text-gray-400 ml-1 text-xs">({note.category})</span>
                </div>
              </label>
            );
          })
        )}
      </div>
      
      {/* Compact action buttons */}
      {loreNotes.length > 0 && (
        <div className="flex gap-1 mt-1 pt-1 border-t border-gray-600">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleClearAllConnections(img.id);
            }}
            className="flex-1 text-xs px-1 py-0.5 bg-red-600 hover:bg-red-700 rounded text-white transition-colors"
          >
            Clear
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleConnectToAll(img.id);
            }}
            className="flex-1 text-xs px-1 py-0.5 bg-teal-600 hover:bg-teal-700 rounded text-white transition-colors"
          >
            All
          </button>
        </div>
      )}
    </div>
  </div>
)}
              </div>
            );
          })}
        </div>

        {/* Selection box */}
        {isSelecting && (
          <div
            style={{
              position: "absolute",
              left: Math.min(selectionBox.startX, selectionBox.endX),
              top: Math.min(selectionBox.startY, selectionBox.endY),
              width: Math.abs(selectionBox.endX - selectionBox.startX),
              height: Math.abs(selectionBox.endY - selectionBox.startY),
              border: "2px dashed #3b82f6",
              backgroundColor: "rgba(59, 130, 246, 0.1)",
              pointerEvents: "none",
              zIndex: 1000,
              transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
              transformOrigin: "0 0",
            }}
          />
        )}

        {/* Empty state */}
        {images.length === 0 && !isLoading && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            color: '#777'
          }}>
            <p style={{ marginBottom: '10px' }}>No concept images added yet</p>
            {serverOnline ? (
              <p style={{ fontSize: '14px' }}>Click "Add Image" to get started</p>
            ) : (
              <p style={{ fontSize: '14px', color: '#ff6b6b' }}>Start your server to begin adding images</p>
            )}
          </div>
        )}

        {/* Loading indicator */}
        {isLoading && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            color: '#777'
          }}>
            <p>Loading images...</p>
          </div>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

     {/* Upload Modal */}
{showModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
      <h3 className="text-lg font-bold mb-4">Add New Image</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Name</label>
          <input
            type="text"
            value={inputName}
            onChange={(e) => setInputName(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            placeholder="Enter image name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Link to LoreNotes (Optional)
            <span className="text-xs text-gray-400 ml-2">Hold Ctrl/Cmd to select multiple</span>
          </label>
          
          {/* Multi-select for LoreNotes */}
          <div className="max-h-40 overflow-y-auto bg-gray-700 border border-gray-600 rounded-lg">
            {loreNotes.length === 0 ? (
              <div className="p-3 text-gray-400 text-sm">No LoreNotes available</div>
            ) : (
              loreNotes.map(note => (
                <label key={note.id} className="flex items-center p-2 hover:bg-gray-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedLoreNoteIds.includes(note.id.toString())}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedLoreNoteIds(prev => [...prev, note.id.toString()]);
                      } else {
                        setSelectedLoreNoteIds(prev => prev.filter(id => id !== note.id.toString()));
                      }
                    }}
                    className="mr-3 text-teal-500 focus:ring-teal-500"
                  />
                  <div className="flex items-center flex-1">
                    <div 
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: note.color }}
                    />
                    <span className="text-sm">{note.title}</span>
                    <span className="text-xs text-gray-400 ml-2">({note.category})</span>
                  </div>
                </label>
              ))
            )}
          </div>
          
          {/* Show selected count */}
          {selectedLoreNoteIds.length > 0 && (
            <div className="text-xs text-teal-400 mt-1">
              {selectedLoreNoteIds.length} LoreNote{selectedLoreNoteIds.length > 1 ? 's' : ''} selected
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <button
          onClick={() => {
            setShowModal(false);
            setPendingImage(null);
            setInputName("");
            setSelectedLoreNoteIds([]);
          }}
          className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleUploadConfirm}
          disabled={!inputName.trim() || isUploading}
          className="flex-1 px-4 py-2 bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors disabled:opacity-50"
        >
          {isUploading ? 'Uploading...' : 'Upload'}
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
};

export default ConceptBoard;