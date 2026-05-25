import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X, BookOpen, Users, Globe, Music, Zap } from 'lucide-react';
import { API_URL } from '../api';

const LoreNotes = ({ onUpdateNotes }) => {
  const [loreNotes, setLoreNotes] = useState(() => {
    const saved = localStorage.getItem('melodicJustice_loreNotes');
    return saved ? JSON.parse(saved) : [
      {
        id: 1,
        title: "Jax Character Profile",
        category: "Characters",
        content: "Main protagonist. Lost his brother Jett to Black Sun. Skilled guitarist who discovers his instrument can transform into a weapon. Carries guilt about his brother's death but finds strength through music and friendship.",
        lastUpdated: new Date().toISOString(),
        color: "#EC4899"
      },
      {
        id: 2,
        title: "Stress Relay Technology", 
        category: "World Building",
        content: "Revolutionary technology invented by Dr. White that converts human stress and emotional energy into usable power. Originally designed to help people cope with anxiety, but was corrupted by The Shadow to drain people's life force and turn them into Umbrals.",
        lastUpdated: new Date().toISOString(),
        color: "#00dbdd"
      },
      {
        id: 3,
        title: "Black Sun Organization",
        category: "Antagonists",
        content: "Criminal organization led by The Shadow. They corrupt Dr. White's Stress Relay technology to drain people's energy and create Umbral soldiers. Their ultimate goal is to harness the collective stress and despair of the city's population.",
        lastUpdated: new Date().toISOString(),
        color: "#FF3D3D"
      }
    ];
  });

  const [conceptImages, setConceptImages] = useState([]);
  const [editingNote, setEditingNote] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedNote, setSelectedNote] = useState(null);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [selectedImageModal, setSelectedImageModal] = useState(null);
  const [newNote, setNewNote] = useState({
    title: '',
    category: 'Characters',
    content: '',
    color: '#EC4899'
  });

  const categories = [
    { name: 'All', icon: BookOpen, color: '#6b7280' },
    { name: 'Characters', icon: Users, color: '#EC4899' },
    { name: 'World Building', icon: Globe, color: '#00dbdd' },
    { name: 'Music/Audio', icon: Music, color: '#4ADE80' },
    { name: 'Technology', icon: Zap, color: '#f59e0b' },
    { name: 'Story/Plot', icon: BookOpen, color: '#8b5cf6' },
    { name: 'Antagonists', icon: Users, color: '#FF3D3D' },
  ];

  const categoryColors = {
    'Characters': '#EC4899',
    'World Building': '#00dbdd', 
    'Music/Audio': '#4ADE80',
    'Technology': '#f59e0b',
    'Story/Plot': '#8b5cf6',
    'Antagonists': '#FF3D3D'
  };

  // Custom scrollbar styles
  const customScrollbarStyles = `
  .modal-backdrop {
    backdrop-filter: blur(10px) !important;
    -webkit-backdrop-filter: blur(10px) !important;
    background: rgba(0, 0, 0, 0.6) !important;
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    right: 0 !important;
    bottom: 0 !important;
    width: 100vw !important;
    height: 100vh !important;
    z-index: 9999 !important;
  }
    .lore-scrollbar {
      scrollbar-width: thin;
      scrollbar-color: #ff3d7f #1f2937;
    }
    
    .lore-scrollbar::-webkit-scrollbar {
      width: 14px;
    }
    
    .lore-scrollbar::-webkit-scrollbar-track {
      background: linear-gradient(to bottom, #1f2937, #111827);
      border-radius: 12px;
      margin: 4px;
      border: 1px solid rgba(255, 255, 255, 0.05);
    }
    
    .lore-scrollbar::-webkit-scrollbar-thumb {
      background: linear-gradient(135deg, #ff3d7f 0%, #ff9db8 50%, #00dbdd 100%);
      border-radius: 12px;
      border: 2px solid transparent;
      background-clip: content-box;
      box-shadow: 
        inset 0 0 0 1px rgba(255, 255, 255, 0.2),
        0 0 10px rgba(255, 61, 127, 0.3);
    }
    
    .lore-scrollbar::-webkit-scrollbar-thumb:hover {
      background: linear-gradient(135deg, #ff9db8 0%, #ff3d7f 50%, #3CDFFF 100%);
      background-clip: content-box;
      box-shadow: 
        inset 0 0 0 1px rgba(255, 255, 255, 0.3),
        0 0 15px rgba(255, 61, 127, 0.5),
        0 0 25px rgba(0, 219, 221, 0.3);
      transform: scale(1.05);
    }
    
    .lore-scrollbar::-webkit-scrollbar-thumb:active {
      background: linear-gradient(135deg, #ff3d7f 0%, #3CDFFF 100%);
      background-clip: content-box;
      box-shadow: 
        inset 0 0 0 1px rgba(255, 255, 255, 0.4),
        0 0 20px rgba(255, 61, 127, 0.6);
    }

    .lore-scrollbar::-webkit-scrollbar-corner {
      background: #1f2937;
    }

    /* For Firefox */
    @supports (scrollbar-width: thin) {
      .lore-scrollbar {
        scrollbar-width: thin;
        scrollbar-color: #ff3d7f #1f2937;
      }
    }
  `;

  // Load concept images from localStorage
  useEffect(() => {
    const loadConceptImages = () => {
      try {
        const storedImages = localStorage.getItem('conceptBoard_images');
        if (storedImages) {
          setConceptImages(JSON.parse(storedImages));
        }
      } catch (error) {
        console.error('Failed to load concept images:', error);
      }
    };

    loadConceptImages();
    
    const handleStorageChange = (e) => {
      if (e.key === 'conceptBoard_images') {
        loadConceptImages();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Get images that match the current note.
  // Bug fix: previously only looked at img.loreNoteId (singular legacy field),
  // so images linked to multiple notes via the checkbox UI only showed up
  // under their first linked note. Now checks the loreNoteIds array first.
  const getRelatedImages = (note) => {
    if (!conceptImages.length || !note) return [];
    const noteIdStr = note.id.toString();

    return conceptImages.filter(img => {
      // 1. Explicit multi-link (current data model)
      const linkedIds = img.loreNoteIds && img.loreNoteIds.length > 0
        ? img.loreNoteIds
        : (img.loreNoteId ? [img.loreNoteId] : []);
      if (linkedIds.length > 0) {
        return linkedIds.some(id => id.toString() === noteIdStr);
      }

      // 2. No explicit links — fall back to category match
      if (img.category && note.category &&
          img.category.toLowerCase() === note.category.toLowerCase()) {
        return true;
      }

      // 3. Fall back to character-name-in-title heuristic
      if (note.title && img.name) {
        const noteWords = note.title.toLowerCase().split(' ');
        const imgWords = img.name.toLowerCase().split(' ');
        return noteWords.some(word =>
          word.length > 2 && imgWords.some(imgWord =>
            imgWord.includes(word) || word.includes(imgWord)
          )
        );
      }

      return false;
    });
  };

  // Inject custom scrollbar styles
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.innerHTML = customScrollbarStyles;
    document.head.appendChild(styleElement);
    
    return () => {
      if (document.head.contains(styleElement)) {
        document.head.removeChild(styleElement);
      }
    };
  }, []);

  // Save to localStorage whenever notes change
  useEffect(() => {
    localStorage.setItem('melodicJustice_loreNotes', JSON.stringify(loreNotes));
    onUpdateNotes(loreNotes);
  }, [loreNotes, onUpdateNotes]);

  const filteredNotes = selectedCategory === 'All' 
    ? loreNotes 
    : loreNotes.filter(note => note.category === selectedCategory);

  const openNoteModal = (note) => {
    setSelectedNote({...note});
    setShowNoteModal(true);
  };

  const closeNoteModal = () => {
    setShowNoteModal(false);
    setSelectedNote(null);
  };

  const updateNoteInModal = (field, value) => {
    const updatedNote = { ...selectedNote, [field]: value };
    setSelectedNote(updatedNote);
    
    setLoreNotes(loreNotes.map(note => 
      note.id === selectedNote.id 
        ? { ...updatedNote, lastUpdated: new Date().toISOString() }
        : note
    ));
  };

  const addNote = () => {
    if (newNote.title.trim() && newNote.content.trim()) {
      const note = {
        ...newNote,
        id: loreNotes.length > 0 ? Math.max(...loreNotes.map(n => n.id)) + 1 : 1,
        lastUpdated: new Date().toISOString(),
        color: categoryColors[newNote.category] || '#EC4899'
      };
      
      setLoreNotes([...loreNotes, note]);
      setNewNote({ title: '', category: 'Characters', content: '', color: '#EC4899' });
      setShowAddModal(false);
    }
  };

  const updateNote = (id, updates) => {
    setLoreNotes(loreNotes.map(note => 
      note.id === id 
        ? { ...note, ...updates, lastUpdated: new Date().toISOString() }
        : note
    ));
    setEditingNote(null);
  };

  const deleteNote = (id) => {
    setLoreNotes(loreNotes.filter(note => note.id !== id));
  };

  const handleUnlinkImageFromNote = (imageId, noteId) => {
    try {
      console.log('Unlinking image from note:', { imageId, noteId });
      
      // Get current concept images from localStorage
      const storedImages = localStorage.getItem('conceptBoard_images');
      if (!storedImages) {
        console.log('No stored images found');
        return;
      }

      const conceptImages = JSON.parse(storedImages);
      console.log('Current images before unlink:', conceptImages.length);
      
      // Find the specific image
      const targetImage = conceptImages.find(img => img.id === imageId);
      if (!targetImage) {
        console.log('Target image not found:', imageId);
        return;
      }
      
      console.log('Target image before unlink:', targetImage);
      
      // Update the specific image to remove connection to this note
      const updatedImages = conceptImages.map(img => {
        if (img.id === imageId) {
          // Handle multiple connections
          if (img.loreNoteIds && Array.isArray(img.loreNoteIds)) {
            const updatedNoteIds = img.loreNoteIds.filter(id => id.toString() !== noteId.toString());
            console.log('Removing from multiple connections:', { 
              before: img.loreNoteIds, 
              after: updatedNoteIds,
              removing: noteId 
            });
            return {
              ...img,
              loreNoteIds: updatedNoteIds,
              loreNoteId: updatedNoteIds.length > 0 ? updatedNoteIds[0] : null
            };
          }
          // Handle single connection (backward compatibility)
          else if (img.loreNoteId && img.loreNoteId.toString() === noteId.toString()) {
            console.log('Removing single connection:', { loreNoteId: img.loreNoteId, noteId });
            return {
              ...img,
              loreNoteId: null,
              loreNoteIds: []
            };
          }
        }
        return img;
      });

      // Save back to localStorage
      localStorage.setItem('conceptBoard_images', JSON.stringify(updatedImages));
      console.log('Updated localStorage with new image data');
      
      // Update local state to reflect changes immediately
      setConceptImages(updatedImages);
      console.log('Updated local conceptImages state');
      
      // Force trigger a storage event for ConceptBoard to pick up changes
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'conceptBoard_images',
        newValue: JSON.stringify(updatedImages)
      }));
      
      // Show success message
      const updatedImage = updatedImages.find(img => img.id === imageId);
      console.log('Image after unlink:', updatedImage);
      
      // Optional: Try to update server (but don't block on failure)
      updateImageOnServer(imageId, updatedImage).catch(error => {
        console.log('Server update failed (expected), changes saved locally:', error.message);
      });
      
    } catch (error) {
      console.error('Failed to unlink image from note:', error);
    }
  };

  // Helper function to update server (optional, will work with fallback)
  const updateImageOnServer = async (imageId, imageData) => {
    try {
      console.log('Attempting server update for image:', imageId);
      
      const response = await fetch(`${API_URL}/images/${imageId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          loreNoteId: imageData.loreNoteId,
          loreNoteIds: imageData.loreNoteIds || []
        })
      });
      
      if (response.ok) {
        console.log('Server updated successfully');
        return await response.json();
      } else {
        throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.log('Server update failed:', error.message);
      throw error; // Re-throw for the catch handler above
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold text-white">Lore & Character Reference</h3>
          <p className="text-gray-400">Character profiles, world-building, and story details</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-lg flex items-center gap-2 shadow-lg transition-all"
        >
          <Plus className="h-4 w-4" />
          Add Lore Note
        </button>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map(category => {
          const IconComponent = category.icon;
          return (
            <button
              key={category.name}
              onClick={() => setSelectedCategory(category.name)}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                selectedCategory === category.name
                  ? 'text-white shadow-lg'
                  : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
              style={{
                backgroundColor: selectedCategory === category.name ? category.color : undefined
              }}
            >
              <IconComponent className="h-4 w-4" />
              {category.name}
            </button>
          );
        })}
      </div>

      {/* Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredNotes.map(note => (
          <div
            key={note.id}
            className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all group cursor-pointer"
            style={{ borderTop: `4px solid ${note.color}` }}
            onClick={() => openNoteModal(note)}
          >
            {/* Note Header */}
            <div className="p-4 border-b border-gray-700">
              <div className="flex justify-between items-start mb-2">
                <h4 className="text-lg font-bold text-white line-clamp-2">{note.title}</h4>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingNote(note);
                    }}
                    className="p-1 rounded hover:bg-gray-700 transition-all"
                  >
                    <Edit className="h-4 w-4 text-gray-400 hover:text-white" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNote(note.id);
                    }}
                    className="p-1 rounded hover:bg-gray-700 transition-all"
                  >
                    <Trash2 className="h-4 w-4 text-gray-400 hover:text-red-400" />
                  </button>
                </div>
              </div>
              
              <div className="flex justify-between items-center text-sm">
                <span 
                  className="px-2 py-1 rounded-full text-xs font-medium"
                  style={{ 
                    backgroundColor: `${note.color}20`,
                    color: note.color 
                  }}
                >
                  {note.category}
                </span>
                <span className="text-gray-500">
                  {formatDate(note.lastUpdated)}
                </span>
              </div>
            </div>

            {/* Note Content Preview */}
            <div className="p-4">
              <p className="text-gray-300 text-sm leading-relaxed line-clamp-6">
                {note.content.length > 150 ? `${note.content.substring(0, 150)}...` : note.content}
              </p>
            </div>
          </div>
        ))}

        {filteredNotes.length === 0 && (
          <div className="col-span-full text-center py-12">
            <BookOpen className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No lore notes in this category yet</p>
            <p className="text-gray-600 text-sm">Start building your story's world!</p>
          </div>
        )}
      </div>

      {/* Note Reading Modal with Floating Images */}
        {showNoteModal && selectedNote && (
  <div 
    style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      right: 0,
      bottom: 0,
      width: '100vw', 
      height: '100vh',
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px'
    }}
  >
    {/* Floating Images Around Modal */}
    {(() => {
      const relatedImages = getRelatedImages(selectedNote);
      const numRelatedImages = relatedImages.length;
      const imagesPerSide = Math.ceil(numRelatedImages / 2);
      
      const horizontalDistanceFromCenter = 600;
      const verticalSpread = 300;

      return relatedImages.map((img, index) => {
        // Get proper aspect ratio
        const aspectRatio = img.aspectRatio || 
          (img.width && img.height ? img.width / img.height : 1);
        
        // Calculate display size maintaining aspect ratio
        const maxSize = 180;
        let displayWidth = maxSize;
        let displayHeight = maxSize / aspectRatio;
        
        // If height is too big, scale down proportionally
        if (displayHeight > maxSize) {
          displayHeight = maxSize;
          displayWidth = maxSize * aspectRatio;
        }
        
        // Ensure minimum size but maintain ratio
        const minSize = 100;
        if (displayWidth < minSize) {
          displayWidth = minSize;
          displayHeight = minSize / aspectRatio;
        }

        let currentX, currentY;

        if (index < imagesPerSide) {
          currentX = -horizontalDistanceFromCenter;
        } else {
          currentX = horizontalDistanceFromCenter;
        }

        let yIndex = index;
        if (index >= imagesPerSide) {
          yIndex = index - imagesPerSide;
        }
        const totalImagesOnCurrentSide = (index < imagesPerSide) ?
          imagesPerSide : (numRelatedImages - imagesPerSide);
          
        if (totalImagesOnCurrentSide > 1) {
          currentY = (yIndex / (totalImagesOnCurrentSide - 1)) * (verticalSpread * 2) - verticalSpread;
        } else {
          currentY = 0;
        }

        return (
          <div
            key={img.id}
            className="absolute transition-all duration-300 cursor-pointer group"
            style={{
              left: `calc(50% + ${currentX}px - ${displayWidth/2}px)`,
              top: `calc(50% + ${currentY}px - ${displayHeight/2}px)`,
              zIndex: 10001
            }}
            onClick={() => setSelectedImageModal(img)}
          >
            <div className="relative">
              <img
                src={img.src}
                alt={img.name}
                style={{
                  width: `${displayWidth}px`,
                  height: 'auto',
                  objectFit: 'contain'
                }}
                className="rounded-xl shadow-2xl border-2 border-pink-500/50 group-hover:border-cyan-400 group-hover:scale-110 transition-all duration-300"
              />
              
              {/* Unlink button - only visible on hover */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleUnlinkImageFromNote(img.id, selectedNote.id);
                }}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg z-10"
                title="Unlink from this note"
              >
                <span className="text-xs font-bold">×</span>
              </button>
              
              {/* Image info overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-300 rounded-xl flex items-center justify-center">
                <div className="text-white text-center opacity-0 group-hover:opacity-100 transition-all duration-300 p-2">
                  <div className="text-sm font-semibold truncate">{img.name}</div>
                  <div className="text-xs text-gray-300 mt-1">{Math.round(displayWidth)}x{Math.round(displayHeight)}</div>
                  <div className="text-xs text-red-300 mt-1">Click × to unlink</div>
                </div>
              </div>
            </div>
          </div>
        );
      });
    })()}
    
    {/* Main Modal */}
    <div className="bg-gray-900 rounded-2xl w-full max-w-4xl max-h-[85vh] shadow-2xl border border-gray-700 flex flex-col relative" style={{ zIndex: 10000 }}>
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div 
            className="w-5 h-5 rounded-full"
            style={{ backgroundColor: selectedNote.color }}
          ></div>
          <input
            type="text"
            value={selectedNote.title}
            onChange={(e) => updateNoteInModal('title', e.target.value)}
            className="text-2xl font-bold text-white bg-transparent border-none outline-none focus:bg-gray-800 rounded px-3 py-2 flex-1"
          />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400 bg-gray-800 px-3 py-1 rounded-full">
            {selectedNote.category}
          </span>
          {(() => {
            const relatedImages = getRelatedImages(selectedNote);
            return relatedImages.length > 0 && (
              <span className="text-xs text-pink-400 bg-pink-500/20 px-3 py-1 rounded-full flex items-center gap-1">
                📸 {relatedImages.length} images
              </span>
            );
          })()}
          <button 
            className="text-gray-400 hover:text-white transition-all p-2"
            onClick={closeNoteModal}
          >
            <X className="h-6 w-6" />
          </button>
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 p-6 overflow-y-auto lore-scrollbar">
        <textarea
          value={selectedNote.content}
          onChange={(e) => updateNoteInModal('content', e.target.value)}
          className="w-full h-full min-h-[400px] bg-transparent text-gray-300 border-none outline-none resize-none text-lg leading-relaxed lore-scrollbar"
          placeholder="Write your lore note here..."
        />
      </div>
      
      {/* Footer */}
      <div className="flex items-center justify-between p-6 border-t border-gray-800">
        <div className="flex items-center gap-4">
          <select
            value={selectedNote.category}
            onChange={(e) => {
              const newCategory = e.target.value;
              const newColor = categoryColors[newCategory] || '#EC4899';
              updateNoteInModal('category', newCategory);
              updateNoteInModal('color', newColor);
            }}
            className="bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none"
          >
            {categories.slice(1).map(cat => (
              <option key={cat.name} value={cat.name}>{cat.name}</option>
            ))}
          </select>
          
          <div className="flex items-center gap-2">
            <span className="text-gray-400 text-sm">Color:</span>
            <div className="flex gap-2">
              {Object.entries(categoryColors).map(([catName, color]) => (
                <button
                  key={catName}
                  onClick={() => updateNoteInModal('color', color)}
                  className={`w-6 h-6 rounded-full border-2 transition-all hover:scale-110 ${
                    selectedNote.color === color ? 'border-white shadow-lg' : 'border-gray-600'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {selectedNote.lastUpdated && (
            <span className="text-xs text-gray-500">
              Last updated: {formatDate(selectedNote.lastUpdated)}
            </span>
          )}
          <button 
            className="text-red-400 hover:text-red-300 transition-all p-2"
            onClick={() => {
              if (window.confirm('Delete this lore note?')) {
                deleteNote(selectedNote.id);
                closeNoteModal();
              }
            }}
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  </div>
)}

      {/* Image Fullscreen Modal */}
      {selectedImageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-90 backdrop-blur-md flex items-center justify-center z-[110] p-4">
          <div className="relative max-w-[90vw] max-h-[90vh]">
            <button 
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-all"
              onClick={() => setSelectedImageModal(null)}
            >
              <X className="h-8 w-8" />
            </button>
           <img
  src={selectedImageModal.src}
  alt={selectedImageModal.name}
  style={{
    maxWidth: '90vw',
    maxHeight: '90vh',
    width: 'auto',
    height: 'auto',
    objectFit: 'contain'
  }}
  className="rounded-lg shadow-2xl"
/>
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-80 p-4 rounded-b-lg">
              <h3 className="text-white font-bold text-lg">{selectedImageModal.name}</h3>
              <p className="text-gray-300 text-sm">{selectedImageModal.category}</p>
              {selectedImageModal.loreNoteId && (
                <p className="text-pink-400 text-xs mt-1">Linked to LoreNote ID: {selectedImageModal.loreNoteId}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Note Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-lg p-6 max-w-2xl w-full mx-4 shadow-2xl border border-gray-800">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-white">Add New Lore Note</h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-white transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 mb-2">Title</label>
                  <input
                    type="text"
                    value={newNote.title}
                    onChange={(e) => setNewNote({...newNote, title: e.target.value})}
                    placeholder="Character name, location, concept..."
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-pink-500 focus:outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-400 mb-2">Category</label>
                  <select
                    value={newNote.category}
                    onChange={(e) => setNewNote({...newNote, category: e.target.value})}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-pink-500 focus:outline-none"
                  >
                    {categories.slice(1).map(cat => (
                      <option key={cat.name} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-400 mb-2">Content</label>
                <textarea
                  value={newNote.content}
                  onChange={(e) => setNewNote({...newNote, content: e.target.value})}
                  placeholder="Detailed information about this character, location, or concept. Include backstory, abilities, relationships, history, etc."
                  rows={8}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-pink-500 focus:outline-none resize-none lore-scrollbar"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={addNote}
                  disabled={!newNote.title.trim() || !newNote.content.trim()}
                  className="px-4 py-2 rounded-lg text-white shadow-md hover:shadow-lg transition-all bg-gradient-to-r from-pink-500 to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Note
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Note Modal */}
      {editingNote && (
        <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-lg p-6 max-w-2xl w-full mx-4 shadow-2xl border border-gray-800">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-white">Edit Lore Note</h3>
              <button 
                onClick={() => setEditingNote(null)}
                className="text-gray-400 hover:text-white transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 mb-2">Title</label>
                  <input
                    type="text"
                    value={editingNote.title}
                    onChange={(e) => setEditingNote({...editingNote, title: e.target.value})}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-pink-500 focus:outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-400 mb-2">Category</label>
                  <select
                    value={editingNote.category}
                    onChange={(e) => setEditingNote({...editingNote, category: e.target.value, color: categoryColors[e.target.value]})}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-pink-500 focus:outline-none"
                  >
                    {categories.slice(1).map(cat => (
                      <option key={cat.name} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-400 mb-2">Content</label>
                <textarea
                  value={editingNote.content}
                  onChange={(e) => setEditingNote({...editingNote, content: e.target.value})}
                  rows={8}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-pink-500 focus:outline-none resize-none lore-scrollbar"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setEditingNote(null)}
                  className="px-4 py-2 rounded-lg border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => updateNote(editingNote.id, editingNote)}
                  className="px-4 py-2 rounded-lg text-white shadow-md hover:shadow-lg transition-all bg-gradient-to-r from-pink-500 to-purple-600"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoreNotes;