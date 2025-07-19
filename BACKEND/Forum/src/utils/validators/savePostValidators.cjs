const Joi = require("joi")
const bcryptHashRegex = /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/;

const paramsSchema = Joi.object({
  post: Joi.string().length(60).pattern(bcryptHashRegex).required().messages({
    "any.required": "Post ID is required",
    "string.empty": "Post ID cannot be empty",
  }),
});

module.exports = paramsSchema

