// API configuration for Railway deployment
const API_BASE_URL = typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? (__API_URL__ || 'http://localhost:5001')
  : ''; // Empty string for relative paths in production (same domain)

// Scanner API configuration - for OCR scanning functionality
const SCANNER_API_BASE_URL = typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? 'http://localhost:3001'
  : `${API_BASE_URL}/scanner`; // In production, scanner is integrated into main API

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
  
  // Saved posts endpoints
  SAVED_POSTS: `${API_BASE_URL}/api/v1/saved`,
  SAVED_POST_ACTION: (postId, action) => `${API_BASE_URL}/api/v1/saved/${encodeURIComponent(postId)}/${action}`,
  
  // Like endpoints
  LIKE_BASE: `${API_BASE_URL}/api/v1/like`,
  LIKE_ACTION: (postId, action) => `${API_BASE_URL}/api/v1/like/${encodeURIComponent(postId)}/${action}`,
  
  // Thread endpoints
  USER_THREAD_ID: `${API_BASE_URL}/api/v1/user/threadId`,
  
  // Post endpoints (additional)
  POST_BY_ID: (postId) => `${API_BASE_URL}/api/v1/post/getPost/${encodeURIComponent(postId)}`,
  POST_BY_TITLE: (title) => `${API_BASE_URL}/api/v1/post/getPost/title/${encodeURIComponent(title)}`,
  POST_DELETE: (postId) => `${API_BASE_URL}/api/v1/post/${encodeURIComponent(postId)}/delete`,
  POST_MY_DRAFTS: `${API_BASE_URL}/api/v1/post/myDrafts`,
  POST_EDIT_DRAFT: (postId) => `${API_BASE_URL}/api/v1/post/myDrafts/${encodeURIComponent(postId)}/edit`,
  
  // Password reset endpoints
  FORGOT_PASSWORD: `${API_BASE_URL}/api/v1/forgot_password/`,
  FORGOT_PASSWORD_RESET: `${API_BASE_URL}/api/v1/forgot_password/reset`,
  
  // Medication endpoints
  MEDICATION_CARE_RECIPIENTS: `${API_BASE_URL}/api/v1/medication/care-recipients`,
  MEDICATION_CARE_RECIPIENT_BY_ID: (id) => `${API_BASE_URL}/api/v1/medication/care-recipients/${encodeURIComponent(id)}`,
  MEDICATION_BASE: `${API_BASE_URL}/api/v1/medication/medications`,
  MEDICATION_BY_ID: (id) => `${API_BASE_URL}/api/v1/medication/medications/${encodeURIComponent(id)}`,
  MEDICATION_USER_DATA: `${API_BASE_URL}/api/v1/medication/user-data`,
  MEDICATION_UPLOAD_IMAGE: `${API_BASE_URL}/api/v1/medication/upload-image`,
  MEDICATION_DELETE_IMAGE: `${API_BASE_URL}/api/v1/medication/delete-image`,
  MEDICATION_HEALTH: `${API_BASE_URL}/api/v1/medication/health`,
  
  // Scanner API endpoints (OCR functionality)
  SCANNER_HEALTH: `${SCANNER_API_BASE_URL}/health`,
  SCANNER_SCAN_MEDICATION: `${SCANNER_API_BASE_URL}/scan-medication`,
  
  // Language endpoint
  USER_LANGUAGE: `${API_BASE_URL}/api/v1/user/language`,
  
  // Comment endpoints (additional)
  COMMENT_DELETE: (postId, commentId) => `${API_BASE_URL}/api/v1/${encodeURIComponent(postId)}/comment/${encodeURIComponent(commentId)}/delete`,
  COMMENT_BY_POST: (postId) => `${API_BASE_URL}/api/v1/${encodeURIComponent(postId)}/comment/`,
  
  // Post creation
  POST_CREATE: `${API_BASE_URL}/api/v1/post/create`,
  POST_DRAFT_DELETE: (draftId) => `${API_BASE_URL}/api/v1/post/myDrafts/${encodeURIComponent(draftId)}/delete`,
  POST_DRAFT_BY_ID: (draftId) => `${API_BASE_URL}/api/v1/post/myDrafts/${encodeURIComponent(draftId)}`,
  
  // Translation endpoint
  TRANSLATE: `${API_BASE_URL}/api/v1/lang`,
};

export { API_BASE_URL, SCANNER_API_BASE_URL };
