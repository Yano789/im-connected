const Joi = require("joi")

const {allowedTags} = require("./../../domains/post/model.cjs");

const postDraftSchema = Joi.object({
    draft: Joi.boolean().default(false),

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
    })

})

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
    .default('latest')
});


const paramsSchema = Joi.object({
  post: Joi.string().required().messages({
    "any.required": "Post ID is required",
    "string.empty": "Post ID cannot be empty",
  }),
});


module.exports = {postDraftSchema,querySchema,paramsSchema}
