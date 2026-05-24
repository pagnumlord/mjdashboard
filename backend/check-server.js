// Add this file to your backend folder to check server functionality
// Run with: node check-server.js

const http = require('http');
const fs = require('fs');
const path = require('path');

// Check if data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  console.log('Creating data directory...');
  fs.mkdirSync(dataDir, { recursive: true });
}

// Check if uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  console.log('Creating uploads directory...');
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Create a test file in data directory
fs.writeFileSync(
  path.join(dataDir, 'test.json'), 
  JSON.stringify({ test: 'Server is working correctly' }, null, 2)
);

console.log('Checking if port 5000 is available...');

// Try to create a server on port 5000 to check if it's available
const server = http.createServer();

server.once('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error('\x1b[31mERROR: Port 5000 is already in use!\x1b[0m');
    console.log('This might be caused by:');
    console.log('1. Another instance of the server is already running');
    console.log('2. Another application is using port 5000');
    console.log('\nPlease stop any other server instances or change the port in server.js');
  } else {
    console.error(`Error: ${err.message}`);
  }
});

server.once('listening', () => {
  console.log('\x1b[32mSuccess: Port 5000 is available!\x1b[0m');
  server.close();
  
  console.log('\nServer configuration looks good. You can start the server with:');
  console.log('npm start');
  
  console.log('\nIf you still have issues, check:');
  console.log('1. Node.js is installed properly (node -v)');
  console.log('2. All dependencies are installed (npm install)');
  console.log('3. server.js exists in the backend folder');
});

server.listen(5000);