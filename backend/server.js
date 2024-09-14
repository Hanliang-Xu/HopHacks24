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

const { auth } = require('express-openid-connect');

const config = {
  authRequired: false,
  auth0Logout: true,
  secret: '88dfc8ab2afa5a6b7747da15f0782b12680144ad4946354d8fb5f60d110c5640',
  baseURL: `http://localhost:${port}`,
  clientID: 'upkW9KUF734emVW7w75MNCfBcIrHKw9a',
  issuerBaseURL: 'https://hophacks24.us.auth0.com'
};

// auth router attaches /login, /logout, and /callback routes to the baseURL
app.use(auth(config));

// req.isAuthenticated is provided from the auth router
app.get('/', (req, res) => {
  res.send(req.oidc.isAuthenticated() ? 'Logged in' : 'Logged out');
});