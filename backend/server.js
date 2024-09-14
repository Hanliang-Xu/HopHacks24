// server.js

const express = require('express');
const app = express();
const port = process.env.PORT || 5001;

// Middleware to parse incoming requests with JSON payloads
app.use(express.json());

// Basic route
app.get('/', (req, res) => {
  res.send('Hello, World!');
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
