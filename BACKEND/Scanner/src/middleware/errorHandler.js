import multer from 'multer';

/**
 * Error handling middleware
 */
const errorHandler = (error, req, res, next) => {
  // Only log errors in non-test environments
  if (process.env.NODE_ENV !== 'test') {
    console.error('Server error:', error);
  }
  
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'File too large. Maximum size is 10MB.'
      });
    }
    return res.status(400).json({
      success: false,
      error: error.message
    });
  }

  // Handle file filter errors (custom validation errors)
  if (error.message && error.message.includes('Invalid file type')) {
    return res.status(400).json({
      success: false,
      error: error.message
    });
  }

  res.status(500).json({
    success: false,
    error: 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
};

export default errorHandler;
