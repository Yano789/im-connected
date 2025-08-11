const Joi = require("joi")

const {allowedTags} = require("./../../domains/post/model.cjs");

const postDraftSchema = Joi.object({
  draft: Joi.boolean()
    .truthy("true")
    .falsy("false")
    .default(false)
    .messages({
      "boolean.base": `"draft" must be a boolean`,
      "any.only": `"draft" must be true or false`,
    }),

  title: Joi.alternatives().conditional('draft', {
    is: false,
    then: Joi.string()
      .min(1)
      .max(200)
      .required()
      .messages({
        "string.base": `"title" should be a type of 'text'`,
        "string.empty": `"title" cannot be empty`,
        "string.min": `"title" should have at least {#limit} characters`,
        "string.max": `"title" should have at most {#limit} characters`,
        "any.required": `"title" is required when not a draft`,
      }),
    otherwise: Joi.string()
      .allow('')
      .optional()
      .messages({
        "string.base": `"title" should be a type of 'text'`,
      }),
  }),

  content: Joi.alternatives().conditional('draft', {
    is: false,
    then: Joi.string()
      .min(1)
      .required()
      .messages({
        "string.base": `"content" should be a type of 'text'`,
        "string.empty": `"content" cannot be empty`,
        "string.min": `"content" should have at least {#limit} characters`,
        "any.required": `"content" is required when not a draft`,
      }),
    otherwise: Joi.string()
      .allow('')
      .optional()
      .messages({
        "string.base": `"content" should be a type of 'text'`,
      }),
  }),

  tags: Joi.alternatives().conditional('draft', {
    is: false,
    then: Joi.array()
      .items(Joi.string().valid(...allowedTags).messages({
        "any.only": `"tags" contains invalid tag`,
        "string.base": `"tags" must be strings`,
      }))
      .min(1)
      .max(2)
      .required()
      .messages({
        "array.base": `"tags" must be an array`,
        "array.min": `"tags" must contain at least {#limit} tag(s)`,
        "array.max": `"tags" must contain at most {#limit} tag(s)`,
        "any.required": `"tags" is required when not a draft`,
      }),
    otherwise: Joi.array()
      .items(Joi.string().valid(...allowedTags).messages({
        "any.only": `"tags" contains invalid tag`,
        "string.base": `"tags" must be strings`,
      }))
      .optional()
      .messages({
        "array.base": `"tags" must be an array`,
      }),
  }),

  media: Joi.array()
    .items(
      Joi.object({
        public_id: Joi.string()
          .required()
          .messages({
            "string.base": `"media.public_id" must be a string`,
            "any.required": `"media.public_id" is required`,
          }),
        type: Joi.string()
          .valid('image', 'video')
          .required()
          .messages({
            "any.only": `"media.type" must be one of ['image', 'video']`,
            "any.required": `"media.type" is required`,
          }),
        url: Joi.string()
          .uri()
          .optional()
          .messages({
            "string.uri": `"media.url" must be a valid URI`,
          }),
      })
    )
    .optional()
    .messages({
      "array.base": `"media" must be an array`,
    }),

  mediaToRemove: Joi.array()
    .items(Joi.string().messages({
      "string.base": `"mediaToRemove" must be an array of strings`,
    }))
    .optional()
    .messages({
      "array.base": `"mediaToRemove" must be an array`,
    }),
});


const querySchema = Joi.object({
  filter: Joi.string()
    .allow('default')
    .custom((value, helpers) => {
      // validate comma separated tags, or 'default'
      if (value === 'default') return value;
      const tags = value.split(',').map(t => t.trim());
      for (const tag of tags) {
        if (!allowedTags.includes(tag)) {
          return helpers.error(`Invalid tag: ${tag}`);
        }
      }
      return value;
    })
    .default('default'),

  mode: Joi.string()
    .valid('default', 'Big')
    .default('default'),

  sort: Joi.string()
    .valid('latest', 'most likes', 'most comments', 'earliest')
    .default('latest'),

  source: Joi.string()
    .valid('default', 'personalized','all')
    .default('default')
});


const paramsSchema = Joi.object({
  post: Joi.string().required().messages({
    "any.required": "Post ID is required",
    "string.empty": "Post ID cannot be empty",
  }),
});

const postTitleParamSchema = Joi.object({
  title: Joi.string().required().messages({
    "any.required": "title is required",
    "string.empty": "title cannot be empty",
  }),
});

const searchBarParamSchema = Joi.object({
  search: Joi.string().required().messages({
    "any.required": "search content is required",
    "string.empty": "search content cannot be empty",
  }),
});




module.exports = {postDraftSchema,querySchema,paramsSchema,postTitleParamSchema,searchBarParamSchema};
