const Joi = require("joi")


const emailVerifySchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      "any.required": "Email is required",
      "string.email": "Email must be a valid format",
    }),
  otp: Joi.string()
    .length(6)
    .pattern(/^\d+$/)
    .required()
    .messages({
      "any.required": "OTP is required",
      "string.length": "OTP must be 6 digits",
      "string.pattern.base": "OTP must be numeric",
    }),
});




const emailOTPRequestSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      "string.email": "Invalid email format",
      "any.required": "Email is required",
    }),
});

module.exports = {emailVerifySchema,emailOTPRequestSchema}