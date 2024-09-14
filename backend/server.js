// server.js

const express = require('express');
const app = express();
const port = process.env.PORT || 5001;

// Middleware to parse incoming requests with JSON payloads
app.use(express.json());

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

const { auth } = require('express-openid-connect');

const config = {
  authRequired: false,
  auth0Logout: true,
  secret: 'dhcAev2OGT_tJFwLh4EpdQPcB4nFjzFHhjGErAFRjV0_ekNarIFd4VFXOY5lfMM7',
  baseURL: `http://localhost:3000`,
  clientID: 'dsopP730RXiJTsXy1gZWkdDLwr4C8Rg3',
  issuerBaseURL: 'https://dev-haj05nu05b6qgw3v.us.auth0.com'
};

// auth router attaches /login, /logout, and /callback routes to the baseURL
app.use(auth(config));

// req.isAuthenticated is provided from the auth router
app.get('/', (req, res) => {
  res.send(req.oidc.isAuthenticated() ? 'Logged in' : 'Logged out');
});