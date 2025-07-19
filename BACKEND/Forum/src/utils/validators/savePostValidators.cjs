const Joi = require("joi")


const paramsSchema = Joi.object({
  post: Joi.string().required().messages({
    "any.required": "Post ID is required",
    "string.empty": "Post ID cannot be empty",
  }),
});

module.exports = paramsSchema

