// API configuration
// For Railway deployment, you'll need to set the VITE_API_URL environment variable
// to point to your deployed backend service
const API_BASE_URL = typeof window !== 'undefined' && window.location.hostname === 'localhost' 
  ? (__API_URL__ || 'http://localhost:5001')
  : (__API_URL__ || 'http://localhost:5001'); // Will be replaced with your Railway backend URL

// API endpoints
export const API_ENDPOINTS = {
  // User endpoints
  USER_LOGIN: `${API_BASE_URL}/api/v1/user`,
  USER_SIGNUP: `${API_BASE_URL}/api/v1/user/signup`,
  USER_LOGOUT: `${API_BASE_URL}/api/v1/user/logout`,
  USER_CHECK_AUTH: `${API_BASE_URL}/api/v1/user/check-auth`,
  USER_PREFERENCES: `${API_BASE_URL}/api/v1/user/preferences`,
  USER_DETAILS: `${API_BASE_URL}/api/v1/user/userDetails`,
  USER_GET: `${API_BASE_URL}/api/v1/user/getUser`,
  
  // Email verification endpoints
  EMAIL_VERIFICATION: `${API_BASE_URL}/api/v1/email_verification`,
  EMAIL_VERIFICATION_VERIFY: `${API_BASE_URL}/api/v1/email_verification/verify`,
  
  // Post endpoints
  POST_SEARCH: (searchTerm) => `${API_BASE_URL}/api/v1/post/getPost/search/${encodeURIComponent(searchTerm)}`,
  POST_BASE: `${API_BASE_URL}/api/v1/post`,
  
  // Comment endpoints
  COMMENT_EDIT: (postId, commentId) => `${API_BASE_URL}/api/v1/${encodeURIComponent(postId)}/comment/${encodeURIComponent(commentId)}/edit`,
  COMMENT_CREATE: (postId) => `${API_BASE_URL}/api/v1/${encodeURIComponent(postId)}/comment/create`,
};

export { API_BASE_URL };
