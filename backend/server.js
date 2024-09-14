const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // Allow cross-origin requests
const { auth } = require('express-openid-connect');
require('dotenv').config(); // For environment variables like MongoDB URI

const app = express();
const port = process.env.PORT || 5001;

// MongoDB connection string (make sure to add MONGO_URI in your .env file)
const dbURI = process.env.MONGO_URI;

// Connect to MongoDB
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.log('Error connecting to MongoDB:', err));

// Middleware to parse JSON and handle CORS
app.use(cors()); // Allows requests from frontend (e.g., React on port 3000)
app.use(express.json()); // Parses incoming JSON requests

// Auth0 Configuration
const config = {
  authRequired: false,
  auth0Logout: true,
  secret: process.env.AUTH0_SECRET || 'dhcAev2OGT_tJFwLh4EpdQPcB4nFjzFHhjGErAFRjV0_ekNarIFd4VFXOY5lfMM7',
  baseURL: `http://localhost:3000`,
  clientID: 'dsopP730RXiJTsXy1gZWkdDLwr4C8Rg3',
  issuerBaseURL: 'https://dev-haj05nu05b6qgw3v.us.auth0.com'
};

// Set up Auth0 middleware
app.use(auth(config));

// Define a basic route to check authentication
app.get('/', (req, res) => {
  res.send(req.oidc.isAuthenticated() ? 'Logged in' : 'Logged out');
});

// Define a Comment model for MongoDB
const Comment = mongoose.model('Comment', new mongoose.Schema({
  user: { type: String, required: true },
  comment: { type: String, required: true },
  date: { type: Date, default: Date.now }
}));

// POST route to submit a new comment
app.post('/comments', async (req, res) => {
  try {
    const { user, comment } = req.body;

    // Check if user and comment exist
    if (!user || !comment) {
      return res.status(400).json({ message: 'User and comment are required' });
    }

    // Create and save the comment
    const newComment = new Comment({ user, comment });
    await newComment.save();
    res.status(201).json(newComment);
  } catch (error) {
    res.status(500).json({ message: 'Error submitting comment', error });
  }
});

// GET route to fetch all comments
app.get('/comments', async (req, res) => {
  try {
    const comments = await Comment.find();
    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching comments', error });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
