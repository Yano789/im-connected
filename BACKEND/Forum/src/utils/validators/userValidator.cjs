const Joi = require("joi")


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


module.exports = {loginSchema,signupSchema}