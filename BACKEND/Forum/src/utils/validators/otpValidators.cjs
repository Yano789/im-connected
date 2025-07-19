const Joi = require("joi")


const otpVerifySchema = Joi.object({
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


const sendOTPSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      "any.required": "Email is required",
      "string.email": "Invalid email format",
    }),
  subject: Joi.string()
    .min(1)
    .required()
    .messages({
      "any.required": "Subject is required",
      "string.empty": "Subject cannot be empty",
    }),
  message: Joi.string()
    .min(1)
    .required()
    .messages({
      "any.required": "Message is required",
      "string.empty": "Message cannot be empty",
    }),
  duration: Joi.number()
    .integer()
    .positive()
    .optional()
    .default(1)
    .messages({
      "number.base": "Duration must be a number",
      "number.integer": "Duration must be an integer",
      "number.positive": "Duration must be greater than 0",
    }),
});

module.exports = {otpVerifySchema,sendOTPSchema}