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
});

// Signup validation schema
const signupSchema = Joi.object({
  firstName: Joi.string()
    .pattern(/^[a-zA-Z]*$/)
    .required()
    .messages({
      "any.required": "First name is required",
      "string.pattern.base": "First name must contain only letters",
      "string.empty": "First name cannot be empty",
    }),
  lastName: Joi.string()
    .pattern(/^[a-zA-Z]*$/)
    .required()
    .messages({
      "any.required": "Last name is required",
      "string.pattern.base": "Last name must contain only letters",
      "string.empty": "Last name cannot be empty",
    }),
  username: Joi.string().required().messages({
    "any.required": "Username is required",
    "string.empty": "Username cannot be empty",
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