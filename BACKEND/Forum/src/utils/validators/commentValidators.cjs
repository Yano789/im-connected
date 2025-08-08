const Joi = require("joi")


const postParamSchema = Joi.object({
  post: Joi.string().required().messages({
    "any.required": "Post ID is required",
    "string.empty": "Post ID cannot be empty",
  }),
});



const postAndCommentParamsSchema  = Joi.object({
    post: Joi.string().required().messages({
    "any.required": "Post ID is required",
    "string.empty": "Post ID cannot be empty",
    }),
  comment: Joi.string().required().messages({
    "any.required": "Comment ID is required",
    "string.empty": "Comment ID cannot be empty",
  }),
});


const createCommentBodySchema = Joi.object({
  parentCommentId: Joi.string().allow(null).optional().messages({
    "string.base": "Parent comment ID must be a string"
  }),
  content: Joi.string().min(1).required().messages({
    "any.required": "Content is required",
    "string.empty": "Content cannot be empty",
  }),
});


const editCommentBodySchema = Joi.object({
  content: Joi.string().min(1).required().messages({
    "any.required": "Content is required",
    "string.empty": "Content cannot be empty",
  }),
});


module.exports = {postParamSchema,createCommentBodySchema,editCommentBodySchema,postAndCommentParamsSchema}