import React, { useRef, useState, useEffect } from "react";

const ConceptBoard = () => {
  const boardRef = useRef(null);
  const fileInputRef = useRef(null);

  const [images, setImages] = useState([]);
  const [draggingId, setDraggingId] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [transform, setTransform] = useState({ scale: 1, x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  const [showModal, setShowModal] = useState(false);
  const [pendingImage, setPendingImage] = useState(null);
  const [inputName, setInputName] = useState("");
  const [inputCategory, setInputCategory] = useState("");

  const [isFullscreen, setIsFullscreen] = useState(false);

  // Handle mouse events for dragging images
  const handleMouseDown = (e, id) => {
    e.stopPropagation();
    const image = images.find((img) => img.id === id);
    setDraggingId(id);
    setDragOffset({ x: e.clientX - image.x, y: e.clientY - image.y });
  };

  const handleMouseMove = (e) => {
    if (draggingId) {
      setImages((prev) =>
        prev.map((img) =>
          img.id === draggingId
            ? { ...img, x: e.clientX - dragOffset.x, y: e.clientY - dragOffset.y }
            : img
        )
      );
    } else if (isPanning) {
      setTransform((prev) => ({
        ...prev,
        x: prev.x + (e.clientX - panStart.x),
        y: prev.y + (e.clientY - panStart.y),
      }));
      setPanStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    setDraggingId(null);
    setIsPanning(false);
  };

  // Handle wheel events for zooming
  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY * -0.001;
    setTransform((prev) => ({
      ...prev,
      scale: Math.min(3, Math.max(0.2, prev.scale + delta)),
    }));
  };

  const handleBackgroundMouseDown = (e) => {
    if (e.button === 0) {
      setIsPanning(true);
      setPanStart({ x: e.clientX, y: e.clientY });
    }
  };

  // Handle image upload
  const handleAddImageClick = () => {
    fileInputRef.current.click();
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      // Create an image element to get the natural dimensions
      const img = new Image();
      img.onload = () => {
        // Calculate dimensions to maintain aspect ratio
        const maxWidth = 250; // Set maximum thumbnail width
        const aspectRatio = img.naturalWidth / img.naturalHeight;
        const width = maxWidth;
        const height = width / aspectRatio;

        setPendingImage({
          src: reader.result,
          width: width,
          height: height,
          aspectRatio: aspectRatio,
          originalWidth: img.naturalWidth,
          originalHeight: img.naturalHeight
        });
        setShowModal(true);
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
    e.target.value = null;
  };

  const handleAddImageFromModal = () => {
    if (!pendingImage) return;

    setImages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        src: pendingImage.src,
        x: 100,
        y: 100,
        name: inputName || "Untitled",
        category: inputCategory || "Uncategorized",
        width: pendingImage.width,
        height: pendingImage.height,
        aspectRatio: pendingImage.aspectRatio
      },
    ]);
    setShowModal(false);
    setInputName("");
    setInputCategory("");
    setPendingImage(null);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      boardRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const board = boardRef.current;
    if (board) {
      board.addEventListener("wheel", handleWheel, { passive: false });
      return () => board.removeEventListener("wheel", handleWheel);
    }
  }, []);

  return (
    <div
      ref={boardRef}
      onMouseDown={handleBackgroundMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{
        position: "relative",
        width: "100%",
        height: "calc(100vh - 160px)",
        backgroundColor: "#1a1a1a",
        overflow: "hidden",
        cursor: isPanning ? "grabbing" : "grab",
      }}
    >
      {/* Toolbar */}
      <div style={{ position: "absolute", top: 10, left: 10, zIndex: 10, display: "flex", gap: "8px" }}>
        <button
          onClick={handleAddImageClick}
          style={{
            background: "#00d1b2",
            border: "none",
            padding: "8px 16px",
            borderRadius: "6px",
            color: "#fff",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          + Add Image
        </button>
        <button
          onClick={toggleFullscreen}
          style={{
            background: "#363636",
            color: "#fff",
            padding: "8px 12px",
            borderRadius: "6px",
            border: "none",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          style={{ display: "none" }}
        />
      </div>

      {/* Concept Images */}
      <div
        style={{
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
          transformOrigin: "0 0",
          position: "absolute",
          top: 0,
          left: 0,
        }}
      >
        {images.map((img) => (
          <div
            key={img.id}
            style={{
              position: "absolute",
              left: img.x,
              top: img.y,
              width: img.width,
              cursor: "move",
              userSelect: "none",
              background: "#2a2a2a",
              borderRadius: "8px",
              padding: "4px",
              boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
            }}
            onMouseDown={(e) => handleMouseDown(e, img.id)}
          >
            <img
              src={img.src}
              alt={img.name}
              style={{
                width: "100%",
                height: "auto", // This ensures aspect ratio is preserved
                borderRadius: "4px",
                pointerEvents: "none",
              }}
              draggable={false}
            />
            <div style={{ color: "#fff", fontSize: "0.8rem", marginTop: "4px", textAlign: "center" }}>
              <strong>{img.name}</strong> <br />
              <span style={{ opacity: 0.7 }}>{img.category}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div style={{
            background: "#222",
            padding: "20px",
            borderRadius: "8px",
            width: "300px",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}>
            <h3 style={{ color: "#fff" }}>Add Image Details</h3>
            
            {/* Preview */}
            {pendingImage && (
              <div style={{ marginBottom: "10px" }}>
                <img 
                  src={pendingImage.src} 
                  alt="Preview" 
                  style={{ 
                    width: "100%", 
                    maxHeight: "150px", 
                    objectFit: "contain",
                    background: "#1a1a1a",
                    borderRadius: "4px"
                  }} 
                />
                <div style={{ color: "#aaa", fontSize: "0.8rem", marginTop: "4px" }}>
                  Original size: {pendingImage.originalWidth} × {pendingImage.originalHeight}
                </div>
              </div>
            )}
            
            <input
              type="text"
              placeholder="Name"
              value={inputName}
              onChange={(e) => setInputName(e.target.value)}
              style={{ padding: "8px", borderRadius: "4px" }}
            />
            <input
              type="text"
              placeholder="Category"
              value={inputCategory}
              onChange={(e) => setInputCategory(e.target.value)}
              style={{ padding: "8px", borderRadius: "4px" }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "10px" }}>
              <button 
                onClick={handleAddImageFromModal} 
                style={{ 
                  padding: "8px 12px", 
                  background: "#00d1b2", 
                  color: "#fff", 
                  border: "none", 
                  borderRadius: "4px",
                  cursor: "pointer"
                }}
              >
                Add
              </button>
              <button 
                onClick={() => setShowModal(false)} 
                style={{ 
                  padding: "8px 12px", 
                  background: "#ff3860", 
                  color: "#fff", 
                  border: "none", 
                  borderRadius: "4px",
                  cursor: "pointer"
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConceptBoard;