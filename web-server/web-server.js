// Import the required modules
const http = require('http'); // Module to create HTTP server
const fs = require('fs'); // Module to handle file system operations
const path = require('path'); // Module to work with file and directory paths

// Define the port number for the server to listen on
const PORT = 3000; 

// Create the HTTP server
const server = http.createServer((req, res) => {
    // Check if the requested URL is either the root ("/") or "/index.html"
    if (req.url === '/index.html' || req.url === '/') {
        // Read the 'index.html' file from the 'public' directory
        fs.readFile(path.join(__dirname, 'public', 'index.html'), (err, content) => {
            // If there's an error reading the file
            if (err) {
                // Respond with a 500 Internal Server Error status
                res.writeHead(500);
                res.end('Server Error'); // Send an error message in the response
            } else {
                // If the file is read successfully, respond with a 200 OK status
                res.writeHead(200, {'Content-Type': 'text/html'}); // Set the content type to HTML
                res.end(content); // Send the content of 'index.html' in the response
            }
        });
    } else {
        // For any other URL, read the '404.html' file
        fs.readFile(path.join(__dirname, 'public', '404.html'), (err, content) => {
            // If there's an error reading the file
            if (err) {
                // Respond with a 500 Internal Server Error status
                res.writeHead(500);
                res.end('Server Error'); // Send an error message in the response
            } else {
                // If the file is read successfully, respond with a 404 Not Found status
                res.writeHead(404, {'Content-Type': 'text/html'}); // Set the content type to HTML
                res.end(content); // Send the content of '404.html' in the response
            }
        });
    }
});

// Start the server and listen on the defined PORT
server.listen(PORT, () => console.log(`Server running on port ${PORT}`)); // Log a message indicating the server is running