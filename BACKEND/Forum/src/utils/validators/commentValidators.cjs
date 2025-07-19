const Joi = require("joi")
const bcryptHashRegex = /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/;

const postParamSchema = Joi.object({
  post: Joi.string().length(60).pattern(bcryptHashRegex).required().messages({
    "any.required": "Post ID is required",
    "string.empty": "Post ID cannot be empty",
  }),
});


const commentParamSchema = Joi.object({
  comment: Joi.string().length(60).pattern(bcryptHashRegex).required().messages({
    "any.required": "Comment ID is required",
    "string.empty": "Comment ID cannot be empty",
  }),
});

const postAndCommentParamsSchema  = Joi.object({
    post: Joi.string().length(60).pattern(bcryptHashRegex).required().messages({
    "any.required": "Post ID is required",
    "string.empty": "Post ID cannot be empty",
    }),
  comment: Joi.string().length(60).pattern(bcryptHashRegex).required().messages({
    "any.required": "Comment ID is required",
    "string.empty": "Comment ID cannot be empty",
  }),
});


const createCommentBodySchema = Joi.object({
  parentCommentId: Joi.string().length(60).pattern(bcryptHashRegex).allow(null).optional(), 
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


module.exports = {postParamSchema,commentParamSchema,createCommentBodySchema,editCommentBodySchema,postAndCommentParamsSchema}