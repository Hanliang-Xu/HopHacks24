import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { Auth0Provider } from '@auth0/auth0-react';

const domain = 'dev-haj05nu05b6qgw3v.us.auth0.com';
const clientId = 'dsopP730RXiJTsXy1gZWkdDLwr4C8Rg3';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      redirectUri={window.location.origin}  // Redirect after login
      cacheLocation="localstorage" // Optional: helps with maintaining the session state
    >
      <App />
    </Auth0Provider>
  </React.StrictMode>
);
