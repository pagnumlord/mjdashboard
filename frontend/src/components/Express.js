const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const port = 5000;
app.use(cors());
app.use(express.json());

// Configure storage for images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Set up SQLite database
const db = new sqlite3.Database('./database.sqlite', (err) => {
  if (err) {
    console.error('Error opening database', err);
  } else {
    console.log('Connected to SQLite database');
    db.run(`CREATE TABLE IF NOT EXISTS images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      category TEXT,
      filename TEXT,
      width INTEGER,
      height INTEGER,
      x INTEGER DEFAULT 100,
      y INTEGER DEFAULT 100,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
  }
});

// Serve uploaded images
app.use('/uploads', express.static('uploads'));

// API endpoints
app.get('/api/images', (req, res) => {
  db.all('SELECT * FROM images', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    // Transform DB rows to include full URLs
    const images = rows.map(row => ({
      ...row,
      src: `http://<your-pi-ip>:${port}/uploads/${row.filename}`
    }));
    
    res.json(images);
  });
});

app.post('/api/images', upload.single('image'), (req, res) => {
  const { name, category, width, height } = req.body;
  const filename = req.file.filename;
  
  db.run(
    'INSERT INTO images (name, category, filename, width, height) VALUES (?, ?, ?, ?, ?)',
    [name, category, filename, width, height],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      // Return the new image with its ID and URL
      const newImage = {
        id: this.lastID,
        name, 
        category,
        filename,
        width,
        height,
        x: 100,
        y: 100,
        src: `http://<your-pi-ip>:${port}/uploads/${filename}`
      };
      
      res.status(201).json(newImage);
    }
  );
});

app.put('/api/images/:id', (req, res) => {
  const { id } = req.params;
  const { x, y, name, category } = req.body;
  
  db.run(
    'UPDATE images SET x = ?, y = ?, name = ?, category = ? WHERE id = ?',
    [x, y, name, category, id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      if (this.changes === 0) {
        res.status(404).json({ error: 'Image not found' });
        return;
      }
      
      res.json({ message: 'Image updated successfully' });
    }
  );
});

app.delete('/api/images/:id', (req, res) => {
  const { id } = req.params;
  
  // First get the filename to delete the file
  db.get('SELECT filename FROM images WHERE id = ?', [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    if (!row) {
      res.status(404).json({ error: 'Image not found' });
      return;
    }
    
    // Delete from database
    db.run('DELETE FROM images WHERE id = ?', [id], function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      // Delete the file
      fs.unlink(path.join('uploads', row.filename), (err) => {
        if (err) console.error('Error deleting file:', err);
      });
      
      res.json({ message: 'Image deleted successfully' });
    });
  });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${port}`);
});