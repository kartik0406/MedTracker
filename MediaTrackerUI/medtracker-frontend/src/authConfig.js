// src/authConfig.js

export const msalConfig = {
  auth: {
    clientId: "56f8ef2d-d6e0-4880-9803-8859b2e736ae",
    // Use "common" to support both personal and organizational accounts
    // For organizational accounts only, use your tenant ID
    authority: "https://login.microsoftonline.com/common",
    redirectUri: "http://localhost:5173",
  },
};

export const apiConfig = {
  apiBaseUrl: "http://localhost:5037",
  apiScope: "api://dc633eee-7e3c-4dd9-85f4-4aa850ebf341/access_as_user"
};

// Basic scopes that work for both personal and work accounts
export const loginRequest = {
  scopes: [
    "openid", 
    "profile", 
    "email"
  ]
};

// API scope request - only for work accounts
export const apiRequest = {
  scopes: ["api://dc633eee-7e3c-4dd9-85f4-4aa850ebf341/access_as_user"]
};
