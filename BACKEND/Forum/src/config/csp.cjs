// Content Security Policy configuration for IM-CONNECTED

// This configuration addresses the Railway CSP errors while maintaining security
const CSP_POLICY = {
  // Allow self and HTTPS sources by default
  'default-src': ["'self'", "https:"],
  
  // Script sources - includes the hash from the error message
  'script-src': [
    "'self'",
    "'unsafe-inline'", // Needed for Vite in development
    "'unsafe-eval'",   // Needed for some React features
    "'sha256-ieoeWczDHkReVBsRBqaal5AFMlBtNjMzgwKvLqi/tSU='", // Hash from error
    "https:",
    "blob:"
  ],
  
  // Style sources
  'style-src': [
    "'self'",
    "'unsafe-inline'", // Needed for inline styles
    "https:"
  ],
  
  // Image sources - allows favicon and other images
  'img-src': [
    "'self'",
    "data:",
    "https:",
    "blob:",
    "https://im-connected-production.up.railway.app" // Your Railway domain
  ],
  
  // Font sources
  'font-src': [
    "'self'",
    "https:",
    "data:"
  ],
  
  // Connection sources for API calls
  'connect-src': [
    "'self'",
    "https:",
    "wss:",
    "ws:",
    "https://im-connected-production.up.railway.app"
  ],
  
  // Media sources
  'media-src': [
    "'self'",
    "https:",
    "blob:"
  ],
  
  // Disable object sources for security
  'object-src': ["'none'"],
  
  // Base URI restriction
  'base-uri': ["'self'"],
  
  // Form action restriction
  'form-action': ["'self'"],
  
  // Frame ancestors restriction
  'frame-ancestors': ["'none'"]
};

// Convert policy object to CSP string
function generateCSPString(policy) {
  return Object.entries(policy)
    .map(([directive, sources]) => `${directive} ${sources.join(' ')}`)
    .join('; ');
}

module.exports = {
  CSP_POLICY,
  generateCSPString,
  CSP_STRING: generateCSPString(CSP_POLICY)
};
