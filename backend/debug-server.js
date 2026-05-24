// Save this as debug-server.js in your backend folder
// Run with: node debug-server.js

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5000;

// Enable CORS for all requests
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type']
}));

app.use(express.json());

// Simple test endpoints
app.get('/api/health', (req, res) => {
    console.log('Health check requested');
    res.json({ 
        status: 'online', 
        message: 'Debug server is running!',
        timestamp: new Date().toISOString()
    });
});

app.get('/api/tasks', (req, res) => {
    console.log('Tasks requested');
    res.json([
        { id: 1, text: 'Test task 1', completed: false },
        { id: 2, text: 'Test task 2', completed: true }
    ]);
});

app.get('/api/images', (req, res) => {
    console.log('Images requested');
    res.json([]);
});

// Catch all API routes
app.get('/api/*', (req, res) => {
    console.log(`API request: ${req.method} ${req.path}`);
    res.json({ message: `Debug: ${req.path} endpoint`, method: req.method });
});

// Root route
app.get('/', (req, res) => {
    res.json({ message: 'Debug server is running on port 5000!' });
});

// Error handling
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ error: err.message });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 DEBUG SERVER RUNNING ON PORT ${PORT}`);
    console.log(`🌐 Test at: http://localhost:${PORT}/api/health`);
    console.log(`📋 Tasks at: http://localhost:${PORT}/api/tasks`);
});

// Handle shutdown
process.on('SIGINT', () => {
    console.log('\n👋 Debug server shutting down...');
    process.exit(0);
});