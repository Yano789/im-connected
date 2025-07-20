function normalizeTagsMiddleware(req, res, next) {
  let { tags } = req.body;

  if (typeof tags === 'string') {
    tags = tags.split(',').map(t => t.trim()).filter(Boolean);
  } else if (!Array.isArray(tags)) {
    tags = [];
  }

  req.body.tags = tags;
  next();
}

module.exports = normalizeTagsMiddleware;