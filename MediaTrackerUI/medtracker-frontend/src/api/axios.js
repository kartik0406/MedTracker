// src/api/axios.js

import axios from "axios";
import { msalInstance } from "../msalInstance.js";
import { apiConfig, loginRequest, apiRequest } from "../authConfig.js";

const api = axios.create({
  baseURL: apiConfig.apiBaseUrl,
});

// Attach access token to every API request
api.interceptors.request.use(
  async (config) => {
    const accounts = msalInstance.getAllAccounts();

    if (!accounts || accounts.length === 0) {
      console.warn("No MSAL accounts found");
      return config;
    }

    const account = accounts[0];
    console.log("Acquiring token for account:", account.username);
    
    // Check if it's a personal account (consumers)
    const isPersonalAccount = account.idTokenClaims?.iss?.includes('consumers') || 
                              account.tenantId === '9188040d-6c67-4c5b-b112-36a304b66dad';

    try {
      let tokenRequest;
      
      if (isPersonalAccount) {
        // For personal accounts, only use basic scopes
        console.log("Personal account detected, using basic scopes");
        tokenRequest = { ...loginRequest, account };
      } else {
        // For work accounts, try to get API scope token
        console.log("Work account detected, requesting API scope");
        try {
          const response = await msalInstance.acquireTokenSilent({
            ...apiRequest,
            account,
          });
          if (response && response.accessToken) {
            console.log("API token acquired successfully");
            const token = response.accessToken;
            console.log("Token has dots:", token.includes('.'));
            config.headers.Authorization = `Bearer ${token}`;
            return config;
          }
        } catch (apiErr) {
          console.warn("API scope not available, falling back to basic scopes:", apiErr);
        }
        tokenRequest = { ...loginRequest, account };
      }

      // Acquire token silently
      const response = await msalInstance.acquireTokenSilent(tokenRequest);

      if (response) {
        // For personal accounts with basic scopes, use idToken instead of accessToken
        // accessToken is for Microsoft Graph, idToken is for authentication
        const token = response.idToken || response.accessToken;
        console.log("Token acquired successfully");
        console.log("Using token type:", response.idToken ? "ID Token" : "Access Token");
        console.log("Token preview:", token.substring(0, 50) + "...");
        console.log("Token has dots:", token.includes('.'));
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        console.error("Token response is empty");
      }
    } catch (err) {
      console.error("Token acquisition failed:", err);
      // If silent token acquisition fails, try interactive
      try {
        const interactiveResponse = await msalInstance.acquireTokenPopup({
          ...loginRequest,
          account,
        });
        if (interactiveResponse) {
          const token = interactiveResponse.idToken || interactiveResponse.accessToken;
          console.log("Token acquired via popup");
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (interactiveErr) {
        console.error("Interactive token acquisition failed:", interactiveErr);
      }
    }

    return config;
  },
  (error) => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
  }
);

export default api;
