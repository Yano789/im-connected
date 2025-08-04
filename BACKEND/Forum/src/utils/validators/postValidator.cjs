const Joi = require("joi")

const {allowedTags} = require("./../../domains/post/model.cjs");

const postDraftSchema = Joi.object({
  draft: Joi.boolean().truthy("true").falsy("false").default(false),

  title: Joi.alternatives().conditional('draft', {
    is: false,
    then: Joi.string().min(1).max(200).required(),
    otherwise: Joi.string().allow('').optional()
  }),

  content: Joi.alternatives().conditional('draft', {
    is: false,
    then: Joi.string().min(1).required(),
    otherwise: Joi.string().allow('').optional()
  }),

  tags: Joi.alternatives().conditional('draft', {
    is: false,
    then: Joi.array()
      .items(Joi.string().valid(...allowedTags))
      .min(1)
      .max(2)
      .required(),
    otherwise: Joi.array()
      .items(Joi.string().valid(...allowedTags))
      .optional()
  }),

  media: Joi.array().items(
    Joi.object({
      public_id: Joi.string().required(),
      type: Joi.string().valid('image', 'video').required(),
      url: Joi.string().uri().optional()
    })
  ).optional(),
  mediaToRemove: Joi.array().items(Joi.string()).optional(),

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
