// Import the required modules
const http = require('http'); // Module to create an HTTP server
const fs = require('fs'); // Module to handle file system operations
const path = require('path'); // Module to work with file and directory paths

// Define the port number for the server to listen on
const PORT = 3001;

// Define the path to the items.json file, which will store the items
const ITEMS_FILE = path.join(__dirname, 'items.json');

// Function to read items from the JSON file
function readItems() {
  return new Promise((resolve, reject) => {
    // Read the items.json file
    fs.readFile(ITEMS_FILE, 'utf8', (err, data) => {
      if (err) {
        // If the file does not exist, resolve with an empty array
        if (err.code === 'ENOENT') {
          resolve([]);
        } else {
          // For other errors, reject the promise
          reject(err);
        }
      } else {
        // Parse the JSON data and resolve the promise with the items
        resolve(JSON.parse(data));
      }
    });
  });
}

// Function to write items to the JSON file
function writeItems(items) {
  return new Promise((resolve, reject) => {
    // Write the items to items.json in a pretty-printed JSON format
    fs.writeFile(ITEMS_FILE, JSON.stringify(items, null, 2), 'utf8', (err) => {
      if (err) reject(err); // Reject the promise if there's an error
      else resolve(); // Resolve the promise if write is successful
    });
  });
}

// Function to generate a unique ID for each item
function generateId() {
  return Math.random().toString(36).substr(2, 9); // Generate a random string as ID
}

// Create the HTTP server
const server = http.createServer(async (req, res) => {
  // Helper function to send JSON responses
  const sendJson = (data, statusCode = 200) => {
    res.writeHead(statusCode, { 'Content-Type': 'application/json' }); // Set response headers
    res.end(JSON.stringify(data)); // Send the JSON data as a response
  };

  // Helper function to send error responses
  const sendError = (message, statusCode = 500) => {
    sendJson({ error: message }, statusCode); // Send error message as JSON
  };

  try {
    // Read the current items from the JSON file
    const items = await readItems();

    // Handle GET request to retrieve all items
    if (req.method === 'GET' && req.url === '/items') {
      sendJson(items); // Send the list of items as JSON
    } 
    // Handle GET request to retrieve a specific item by ID
    else if (req.method === 'GET' && req.url.startsWith('/items/')) {
      const id = req.url.split('/')[2]; // Extract the ID from the URL
      const item = items.find(item => item.id === id); // Find the item by ID
      if (item) {
        sendJson(item); // Send the found item as JSON
      } else {
        sendError('Item not found', 404); // Send 404 error if not found
      }
    } 
    // Handle POST request to create a new item
    else if (req.method === 'POST' && req.url === '/items') {
      let body = ''; // Initialize variable to hold request body
      req.on('data', chunk => body += chunk.toString()); // Accumulate data chunks
      req.on('end', async () => {
        const newItem = JSON.parse(body); // Parse the request body as JSON
        newItem.id = generateId(); // Generate a unique ID for the new item
        // Validate the size of the item
        if (!['s', 'm', 'l'].includes(newItem.size)) {
          sendError('Invalid size. Must be s, m, or l', 400); // Send error if size is invalid
          return;
        }
        items.push(newItem); // Add the new item to the list
        await writeItems(items); // Write the updated list to the JSON file
        sendJson(newItem, 201); // Respond with the created item and 201 status
      });
    } 
    // Handle PUT request to update an existing item by ID
    else if (req.method === 'PUT' && req.url.startsWith('/items/')) {
      const id = req.url.split('/')[2]; // Extract the ID from the URL
      let body = ''; // Initialize variable to hold request body
      req.on('data', chunk => body += chunk.toString()); // Accumulate data chunks
      req.on('end', async () => {
        const updatedItem = JSON.parse(body); // Parse the request body as JSON
        const index = items.findIndex(item => item.id === id); // Find the index of the item
        if (index !== -1) {
          // Validate the size of the updated item
          if (!['s', 'm', 'l'].includes(updatedItem.size)) {
            sendError('Invalid size. Must be s, m, or l', 400); // Send error if size is invalid
            return;
          }
          // Update the item in the list
          items[index] = { ...items[index], ...updatedItem, id };
          await writeItems(items); // Write the updated list to the JSON file
          sendJson(items[index]); // Respond with the updated item
        } else {
          sendError('Item not found', 404); // Send 404 error if item not found
        }
      });
    } 
    // Handle DELETE request to remove an item by ID
    else if (req.method === 'DELETE' && req.url.startsWith('/items/')) {
      const id = req.url.split('/')[2]; // Extract the ID from the URL
      const index = items.findIndex(item => item.id === id); // Find the index of the item
      if (index !== -1) {
        const deletedItem = items.splice(index, 1)[0]; // Remove the item from the list
        await writeItems(items); // Write the updated list to the JSON file
        sendJson(deletedItem); // Respond with the deleted item
      } else {
        sendError('Item not found', 404); // Send 404 error if item not found
      }
    } else {
      sendError('Not Found', 404); // Send 404 error for unsupported routes
    }
  } catch (error) {
    sendError('Internal Server Error'); // Handle any unexpected errors
  }
});

// Start the server and listen on the defined PORT
server.listen(PORT, () => console.log(`API Server running on port ${PORT}`)); // Log a message indicating the server is running