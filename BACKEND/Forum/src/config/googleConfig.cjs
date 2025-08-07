// Temporarily disable Google Cloud Storage for Railway deployment
// You can enable this later by setting the environment variables
console.log('Google Cloud Storage is disabled - using Cloudinary instead');

// Export a null client to prevent errors
const gcsClient = null;

module.exports = { gcsClient };