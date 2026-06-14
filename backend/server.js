const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 5000;

app.use(cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Accept', 'Authorization', 'Origin', 'X-Requested-With'],
    credentials: true,
    optionsSuccessStatus: 200
}));


app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static file serving
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

// In-memory data stores
const TASKS_FILE = path.join(__dirname, 'data', 'tasks.json');

// Load tasks from file on startup
let tasks = [];
try {
    if (fs.existsSync(TASKS_FILE)) {
        const data = fs.readFileSync(TASKS_FILE, 'utf8');
        tasks = JSON.parse(data);
    } else {
        // Default tasks if file doesn't exist
        tasks = [
            { id: 1, name: 'Plan project scope', completed: false, milestone: 'Pre-Production', category: 'Planning' },
            { id: 2, name: 'Design character concepts', completed: false, milestone: 'Pre-Production', category: 'Art' },
            { id: 3, name: 'Develop lore notes', completed: true, milestone: 'Pre-Production', category: 'Story' },
        ];
        saveTasks(); // Save default tasks
    }
} catch (error) {
    console.error('Error loading tasks:', error);
    tasks = [];
}

// Helper function to save tasks to file
function saveTasks() {
    try {
        fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2));
        return true;
    } catch (error) {
        console.error('Error saving tasks:', error);
        return false;
    }
}

const NOTES_FILE = path.join(__dirname, 'data', 'notes.json');

// Load notes from file on startup
let notes = [];
try {
    if (fs.existsSync(NOTES_FILE)) {
        const data = fs.readFileSync(NOTES_FILE, 'utf8');
        notes = JSON.parse(data);
    } else {
        // Default notes if file doesn't exist
        notes = [
            { id: 1, title: "Jax Character Profile", category: "Characters", content: "Main protagonist...", lastUpdated: new Date().toISOString(), color: "#EC4899" },
            { id: 2, title: "Stress Relay Technology", category: "World Building", content: "Revolutionary technology...", lastUpdated: new Date().toISOString(), color: "#00dbdd" },
            { id: 3, title: "Black Sun Organization", category: "Antagonists", content: "Criminal organization...", lastUpdated: new Date().toISOString(), color: "#a855f7" }
        ];
        saveNotes(); // Save default notes
    }
} catch (error) {
    console.error('Error loading notes:', error);
    notes = [];
}

// Helper function to save notes to file
function saveNotes() {
    try {
        fs.writeFileSync(NOTES_FILE, JSON.stringify(notes, null, 2));
        return true;
    } catch (error) {
        console.error('Error saving notes:', error);
        return false;
    }
}

const MILESTONES_FILE = path.join(__dirname, 'data', 'milestones.json');

// Load milestones from file on startup
let milestones = [];
try {
    if (fs.existsSync(MILESTONES_FILE)) {
        const data = fs.readFileSync(MILESTONES_FILE, 'utf8');
        milestones = JSON.parse(data);
    } else {
        // Default milestones if file doesn't exist
        milestones = [
            { id: 1, name: 'Pre-Production', completed: false, active: true },
            { id: 2, name: 'Production', completed: false, active: false },
            { id: 3, name: 'Post-Production', completed: false, active: false }
        ];
        saveMilestones(); // Save default milestones
    }
} catch (error) {
    console.error('Error loading milestones:', error);
    milestones = [];
}

// Helper function to save milestones to file
function saveMilestones() {
    try {
        fs.writeFileSync(MILESTONES_FILE, JSON.stringify(milestones, null, 2));
        return true;
    } catch (error) {
        console.error('Error saving milestones:', error);
        return false;
    }
}

const IMAGES_FILE = path.join(__dirname, 'data', 'images.json');

// Ensure data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
}

// Load images from file on startup
let images = [];
try {
    if (fs.existsSync(IMAGES_FILE)) {
        const data = fs.readFileSync(IMAGES_FILE, 'utf8');
        images = JSON.parse(data);
    }
} catch (error) {
    console.error('Error loading images:', error);
    images = [];
}

// Helper function to save images to file
function saveImages() {
    try {
        fs.writeFileSync(IMAGES_FILE, JSON.stringify(images, null, 2));
        return true;
    } catch (error) {
        console.error('Error saving images:', error);
        return false;
    }
}
const BACKUPS_FILE = path.join(__dirname, 'data', 'backups.json');
let backups = { lastSSD: null, lastCloud: null };
try {
    if (fs.existsSync(BACKUPS_FILE)) {
        backups = JSON.parse(fs.readFileSync(BACKUPS_FILE, 'utf8'));
    } else {
        fs.writeFileSync(BACKUPS_FILE, JSON.stringify(backups, null, 2));
    }
} catch (e) {
    console.error('Failed to load backups.json:', e);
}
const saveBackups = () => {
    try { fs.writeFileSync(BACKUPS_FILE, JSON.stringify(backups, null, 2)); return true; }
    catch (e) { console.error('Failed to save backups:', e); return false; }
};

const SHOTS_FILE = path.join(__dirname, 'data', 'shots.json');
const STORYBOARDS_FILE = path.join(__dirname, 'data', 'storyboards.json');

let shots = [];
try {
    if (fs.existsSync(SHOTS_FILE)) {
        const data = fs.readFileSync(SHOTS_FILE, 'utf8');
        shots = JSON.parse(data);
    }
} catch (error) {
    console.error('Error loading shots:', error);
    shots = [];
}

function saveShots() {
    try {
        fs.writeFileSync(SHOTS_FILE, JSON.stringify(shots, null, 2));
        return true;
    } catch (error) {
        console.error('Error saving shots:', error);
        return false;
    }
}

let storyboards = {};
try {
    if (fs.existsSync(STORYBOARDS_FILE)) {
        const data = fs.readFileSync(STORYBOARDS_FILE, 'utf8');
        storyboards = JSON.parse(data);
    }
} catch (error) {
    console.error('Error loading storyboards:', error);
    storyboards = {};
}

function saveStoryboards() {
    try {
        fs.writeFileSync(STORYBOARDS_FILE, JSON.stringify(storyboards, null, 2));
        return true;
    } catch (error) {
        console.error('Error saving storyboards:', error);
        return false;
    }
}

// Multer storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// Handle preflight OPTIONS requests
app.options('*', (req, res) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Accept, Authorization');
    res.sendStatus(200);
});

// API Endpoints

// Tasks
// Backups — manual log of when user copied to external SSD / cloud
app.get('/api/backups', (req, res) => {
    res.json(backups);
});

app.post('/api/backups/record', (req, res) => {
    const { type } = req.body || {};
    if (type !== 'ssd' && type !== 'cloud') {
        return res.status(400).json({ message: 'type must be "ssd" or "cloud"' });
    }
    const key = type === 'ssd' ? 'lastSSD' : 'lastCloud';
    backups[key] = new Date().toISOString();
    if (saveBackups()) res.json(backups);
    else res.status(500).json({ message: 'Failed to save backup record' });
});

app.get('/api/tasks', (req, res) => {
    res.json(tasks);
});

app.post('/api/tasks', (req, res) => {
    const nextOrder = tasks.length ? Math.max(...tasks.map(t => t.order || 0)) + 1 : 1;
    const newTask = {
        id: tasks.length ? Math.max(...tasks.map(t => t.id)) + 1 : 1,
        order: nextOrder,
        ...req.body
    };
    tasks.push(newTask);

    if (saveTasks()) {
        res.status(201).json(newTask);
    } else {
        res.status(500).json({ message: 'Failed to save task to storage' });
    }
});

// Bulk reorder: accepts { orderedIds: [id1, id2, ...] }
// Renumbers the listed tasks' `order` field in the given sequence (1, 2, 3, ...).
// Tasks not in the list keep their existing order value.
app.put('/api/tasks/reorder', (req, res) => {
    const { orderedIds } = req.body || {};
    if (!Array.isArray(orderedIds)) {
        return res.status(400).json({ message: 'orderedIds must be an array' });
    }
    // Coerce ids to numbers so the Map.has(t.id) check works regardless of
    // whether the client sent strings or numbers
    const orderById = new Map(orderedIds.map((id, idx) => [parseInt(id, 10), idx + 1]));
    let updated = 0;
    tasks = tasks.map(t => {
        if (orderById.has(t.id)) {
            updated++;
            return { ...t, order: orderById.get(t.id) };
        }
        return t;
    });
    if (saveTasks()) {
        res.json({ updated });
    } else {
        res.status(500).json({ message: 'Failed to save task order' });
    }
});

app.put('/api/tasks/:id', (req, res) => {
    const { id } = req.params;
    const index = tasks.findIndex(t => t.id === parseInt(id));
    if (index !== -1) {
        tasks[index] = { ...tasks[index], ...req.body };
        
        // CRITICAL FIX: Save to file
        if (saveTasks()) {
            res.json(tasks[index]);
        } else {
            res.status(500).json({ message: 'Failed to save task update' });
        }
    } else {
        res.status(404).json({ message: 'Task not found' });
    }
});

app.delete('/api/tasks/:id', (req, res) => {
    const { id } = req.params;
    const initialLength = tasks.length;
    tasks = tasks.filter(t => t.id !== parseInt(id));
    if (tasks.length < initialLength) {
        // CRITICAL FIX: Save to file
        if (saveTasks()) {
            res.status(200).json({ message: 'Task deleted successfully' });
        } else {
            res.status(500).json({ message: 'Failed to save after task deletion' });
        }
    } else {
        res.status(404).json({ message: 'Task not found' });
    }
});


// Notes
app.get('/api/notes', (req, res) => {
    res.json(notes);
});

app.post('/api/notes', (req, res) => {
    const newNote = { 
        id: notes.length ? Math.max(...notes.map(n => n.id)) + 1 : 1, 
        ...req.body, 
        lastUpdated: new Date().toISOString() 
    };
    notes.push(newNote);

    if (saveNotes()) {
        res.status(201).json(newNote);
    } else {
        res.status(500).json({ message: 'Failed to save note to storage' });
    }
});

app.put('/api/notes/:id', (req, res) => {
    const { id } = req.params;
    const index = notes.findIndex(n => n.id === parseInt(id));
    if (index !== -1) {
        notes[index] = { ...notes[index], ...req.body, lastUpdated: new Date().toISOString() };
        
        // CRITICAL FIX: Save to file after updating note
        if (saveNotes()) {
            res.json(notes[index]);
        } else {
            res.status(500).json({ message: 'Failed to save note update' });
        }
    } else {
        res.status(404).json({ message: 'Note not found' });
    }
});

app.delete('/api/notes/:id', (req, res) => {
    const { id } = req.params;
    const initialLength = notes.length;
    notes = notes.filter(n => n.id !== parseInt(id));
    if (notes.length < initialLength) {
        // CRITICAL FIX: Save to file after deleting note
        if (saveNotes()) {
            res.status(200).json({ message: 'Note deleted successfully' });
        } else {
            res.status(500).json({ message: 'Failed to save after note deletion' });
        }
    } else {
        res.status(404).json({ message: 'Note not found' });
    }
});

// Milestones
app.get('/api/milestones', (req, res) => {
    res.json(milestones);
});

app.put('/api/milestones/:id', (req, res) => {
    const { id } = req.params;
    const index = milestones.findIndex(m => m.id === parseInt(id));
    if (index !== -1) {
        milestones = milestones.map(m =>
            m.id === parseInt(id) ? { ...m, active: true } : { ...m, active: false }
        );
        
        // CRITICAL FIX: Save to file
        if (saveMilestones()) {
            res.json(milestones[index]);
        } else {
            res.status(500).json({ message: 'Failed to save milestone update' });
        }
    } else {
        res.status(404).json({ message: 'Milestone not found' });
    }
});

// Images
app.get('/api/images', (req, res) => {
    res.json(images);
});

// Image upload with proper handling
app.post('/api/images/upload', upload.single('image'), (req, res) => {
    
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }
    
    try {
        // Parse loreNoteIds if it's a JSON string
        let loreNoteIds = [];
        if (req.body.loreNoteIds) {
            try {
                loreNoteIds = JSON.parse(req.body.loreNoteIds);
            } catch (e) {
                loreNoteIds = Array.isArray(req.body.loreNoteIds) ? req.body.loreNoteIds : [req.body.loreNoteIds];
            }
        }
        
        const newImage = {
            id: `img-${Date.now()}`,
            url: `/uploads/${req.file.filename}`,
            posX: req.body.x ? parseInt(req.body.x) : 50,
            posY: req.body.y ? parseInt(req.body.y) : 50,
            width: req.body.width ? parseInt(req.body.width) : 200,
            height: req.body.height ? parseInt(req.body.height) : 150,
            name: req.body.name || `Image ${images.length + 1}`,
            category: req.body.category || 'General',
            loreNoteId: loreNoteIds.length > 0 ? parseInt(loreNoteIds[0]) : null,
            loreNoteIds: loreNoteIds.map(id => parseInt(id))
        };
        
        images.push(newImage);
        
        // CRITICAL FIX: Save to file
        if (saveImages()) {
            res.status(201).json(newImage);
        } else {
            res.status(500).json({ message: 'Failed to save image to storage' });
        }
        
    } catch (error) {
        console.error('Upload processing error:', error);
        res.status(500).json({ message: 'Failed to process upload', error: error.message });
    }
});

// FIXED: Update image details (category, loreNoteId, loreNoteIds, name)
app.put('/api/images/:id', (req, res) => {
    
    const { id } = req.params;
    const { category, loreNoteId, loreNoteIds, name } = req.body;
    const imageIndex = images.findIndex(img => img.id === id);

    if (imageIndex !== -1) {
        const image = images[imageIndex];
        
        if (category !== undefined) {
            image.category = category;
        }
        if (loreNoteId !== undefined) {
            image.loreNoteId = loreNoteId ? parseInt(loreNoteId) : null;
        }
        if (loreNoteIds !== undefined) {
            image.loreNoteIds = Array.isArray(loreNoteIds) ? loreNoteIds.map(id => parseInt(id)) : [];
        }
        if (name !== undefined) {
            image.name = name;
        }
        
        
        // CRITICAL FIX: Save to file
        if (saveImages()) {
            res.json(image);
        } else {
            res.status(500).json({ message: 'Failed to save image updates' });
        }
    } else {
        res.status(404).json({ message: 'Image not found' });
    }
});

// Update image position
app.put('/api/images/:id/position', (req, res) => {
    
    const { id } = req.params;
    const { x, y, posX, posY } = req.body;
    const image = images.find(img => img.id === id);
    if (image) {
        image.posX = posX || x || image.posX;
        image.posY = posY || y || image.posY;
        
        // CRITICAL FIX: Save to file
        if (saveImages()) {
            res.json(image);
        } else {
            res.status(500).json({ message: 'Failed to save position' });
        }
    } else {
        res.status(404).json({ message: 'Image not found' });
    }
});

// Update image size
app.put('/api/images/:id/size', (req, res) => {
    const { id } = req.params;
    const { width, height } = req.body;
    const image = images.find(img => img.id === id);
    if (image) {
        image.width = width;
        image.height = height;
        
        // CRITICAL FIX: Save to file
        if (saveImages()) {
            res.json(image);
        } else {
            res.status(500).json({ message: 'Failed to save size' });
        }
    } else {
        res.status(404).json({ message: 'Image not found' });
    }
});

// Delete image
app.delete('/api/images/:id', (req, res) => {
    const { id } = req.params;
    const initialLength = images.length;
    const imageToDelete = images.find(img => img.id === id);

    if (imageToDelete) {
        const filePath = path.join(__dirname, imageToDelete.url);
        fs.unlink(filePath, (err) => {
            if (err) {
                console.error('Failed to delete image file:', err);
            }
            images = images.filter(img => img.id !== id);
            if (images.length < initialLength) {
                if (saveImages()) {
                    res.status(200).json({ message: 'Image deleted successfully' });
                } else {
                    res.status(500).json({ message: 'Failed to save after image deletion' });
                }
            } else {
                res.status(500).json({ message: 'Failed to delete image from array' });
            }
        });
    } else {
        res.status(404).json({ message: 'Image not found' });
    }
});

// Shots
app.get('/api/shots', (req, res) => {
    res.json(shots);
});

app.post('/api/shots', (req, res) => {
    const newShot = { id: shots.length ? Math.max(...shots.map(s => s.id)) + 1 : 1, ...req.body };
    shots.push(newShot);
    if (saveShots()) {
        res.status(201).json(newShot);
    } else {
        res.status(500).json({ message: 'Failed to save shot to storage' });
    }
});

app.put('/api/shots/:id', (req, res) => {
    const { id } = req.params;
    const index = shots.findIndex(s => s.id === parseInt(id));
    if (index !== -1) {
        shots[index] = { ...shots[index], ...req.body };
        if (saveShots()) {
            res.json(shots[index]);
        } else {
            res.status(500).json({ message: 'Failed to save shot update' });
        }
    } else {
        res.status(404).json({ message: 'Shot not found' });
    }
});

app.delete('/api/shots/:id', (req, res) => {
    const { id } = req.params;
    const initialLength = shots.length;
    shots = shots.filter(s => s.id !== parseInt(id));
    if (shots.length < initialLength) {
        if (saveShots()) {
            res.status(200).json({ message: 'Shot deleted successfully' });
        } else {
            res.status(500).json({ message: 'Failed to save after shot deletion' });
        }
    } else {
        res.status(404).json({ message: 'Shot not found' });
    }
});

// Storyboard routes
app.post('/api/shots/:id/storyboard', upload.single('storyboard'), (req, res) => {
    const { id } = req.params;
    if (!req.file) {
        return res.status(400).json({ message: 'No storyboard file uploaded' });
    }
    storyboards[id] = `/uploads/${req.file.filename}`;
    if (saveStoryboards()) {
        res.status(201).json({ shotId: id, storyboard: storyboards[id] });
    } else {
        res.status(500).json({ message: 'Failed to save storyboard reference' });
    }
});

app.get('/api/shots/:id/storyboard', (req, res) => {
    const { id } = req.params;
    if (storyboards[id]) {
        res.json({ shotId: id, storyboard: storyboards[id] });
    } else {
        res.status(404).json({ message: 'Storyboard not found' });
    }
});

app.delete('/api/shots/:id/storyboard', (req, res) => {
    const { id } = req.params;
    if (storyboards[id]) {
        const filePath = path.join(__dirname, storyboards[id]);
        fs.unlink(filePath, (err) => {
            if (err) console.error('Error deleting storyboard file:', err);
        });
        delete storyboards[id];
        saveStoryboards();
        res.status(200).json({ message: 'Storyboard deleted successfully' });
    } else {
        res.status(404).json({ message: 'Storyboard not found for this shot' });
    }
});

// System status endpoint
app.get('/api/status', (req, res) => {
    res.json({
        storage: { total: 2000000000000, used: 800000000000, percentage: 40 },
        backup: { last_backup: new Date().toISOString(), status: 'OK' },
        render_cache: { total: 500000000000, used: 200000000000, percentage: 40 },
        system_time: new Date().toISOString(),
        uptime: process.uptime(),
        cpu_usage: Math.floor(Math.random() * 100),
        memory_usage: process.memoryUsage()
    });
});

// Health check
app.get('/api/check-connection', (req, res) => {
    res.status(200).json({ status: 'online' });
});

// Start the server
app.listen(PORT, () => {
});