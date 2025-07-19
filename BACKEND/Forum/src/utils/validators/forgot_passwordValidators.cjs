const Joi = require("joi")


const resetPasswordSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      "string.email": "Invalid email format",
      "any.required": "Email is required",
    }),

  otp: Joi.string()
    .length(6)
    .pattern(/^\d+$/)
    .required()
    .messages({
      "string.length": "OTP must be 6 digits",
      "string.pattern.base": "OTP must be numeric",
      "any.required": "OTP is required",
    }),

  newPassword: Joi.string()
    .pattern(/^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/)
    .required()
    .messages({
      "string.pattern.base": "Password must be at least 8 characters, contain an uppercase letter and a special character",
      "any.required": "New password is required",
    }),
});



const passwordResetRequestSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      "string.email": "Invalid email format",
      "any.required": "Email is required",
    }),
});

module.exports = {resetPasswordSchema,passwordResetRequestSchema}