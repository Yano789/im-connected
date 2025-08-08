const { gcsClient } = require('../config/gcsStorage.cjs');

async function attachSignedMediaUrls(post) {
  if (!post.media || !Array.isArray(post.media)) return post;

  const updatedMedia = await Promise.all(
    post.media.map(async (mediaItem) => {
      if (!mediaItem.public_id) return mediaItem;

      console.log("Generating signed URL for file:", mediaItem.public_id);
      const signedUrl = await gcsClient.url(mediaItem.public_id);

      return {
        ...mediaItem,
        secure_url: signedUrl,
        url: signedUrl,
      };
    })
  );

  return {
    ...post.toObject(),  // assuming Mongoose document
    media: updatedMedia,
  };
}

module.exports = attachSignedMediaUrls;

