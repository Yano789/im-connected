const Joi = require("joi")
const{allowedTags} = require("./../../domains/post/model.cjs");

const loginSchema = Joi.object({
  username: Joi.string().required().messages({
    "any.required": "Username is required",
    "string.empty": "Username cannot be empty",
  }),
  password: Joi.string().required().messages({
    "any.required": "Password is required",
    "string.empty": "Password cannot be empty",
  }),
  rememberMe: Joi.boolean().optional(),
});

// Signup validation schema
const signupSchema = Joi.object({
  name: Joi.string()
    .pattern(/^[a-zA-Z]*$/)
    .required()
    .messages({
      "any.required": "Name is required",
      "string.pattern.base": "Name must contain only letters",
      "string.empty": "Name cannot be empty",
    }),
  username: Joi.string().required().messages({
    "any.required": "Username is required",
    "string.empty": "Username cannot be empty",
  }),

  number: Joi.string()
  .pattern(/^\+[1-9]\d{6,14}$/)
  .required()
  .messages({
    "any.required": "Phone number is required",
    "string.empty": "Phone number cannot be empty",
    "string.pattern.base": "Phone number must be valid (e.g. 91234567)",
  }),
  email: Joi.string()
    .email()
    .required()
    .messages({
      "any.required": "Email is required",
      "string.email": "Email must be a valid email address",
      "string.empty": "Email cannot be empty",
    }),
  password: Joi.string()
    .pattern(/^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/)
    .required()
    .messages({
      "any.required": "Password is required",
      "string.pattern.base": "Password must be at least 8 characters, contain one uppercase letter and one special character",
      "string.empty": "Password cannot be empty",
    }),
    
});

const preferencesSchema = Joi.object({
  username: Joi.string().required().messages({
    "any.required": "Username is required",
    "string.empty": "Username cannot be empty",
  }),
  language: Joi.string()
    .valid("en", "zh", "ms", "ta")
    .default("en"),
  textSize: Joi.string()
    .valid("Small", "Medium", "Large")
    .default("Medium"),
  contentMode: Joi.string()
    .valid("Default", "Easy Read")
    .default("Default"),
  topics: Joi.array()
    .items(Joi.string().valid(...allowedTags))
    .default([]),
});

const userDetailsSchema = Joi.object({
  name: Joi.string()
    .pattern(/^[a-zA-Z]*$/)
    .required()
    .messages({
      "any.required": "Name is required",
      "string.pattern.base": "Name must contain only letters",
      "string.empty": "Name cannot be empty",
    }),
  newUsername: Joi.string().required().messages({
    "any.required": "Username is required",
    "string.empty": "Username cannot be empty",
  }),

  number: Joi.string()
  .pattern(/^\+[1-9]\d{6,14}$/)
  .required()
  .messages({
    "any.required": "Phone number is required",
    "string.empty": "Phone number cannot be empty",
    "string.pattern.base": "Phone number must be valid (e.g. 91234567)",
  }),
  email: Joi.string()
    .email()
    .required()
    .messages({
      "any.required": "Email is required",
      "string.email": "Email must be a valid email address",
      "string.empty": "Email cannot be empty",
    })
})



module.exports = {loginSchema,signupSchema,preferencesSchema,userDetailsSchema}