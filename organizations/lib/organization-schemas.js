const Joi = require('@hapi/joi')

module.exports.create = Joi.object({
  name: Joi.string().required(),
})

module.exports.get = Joi.object({
  id: Joi.string().guid().required(),
})

module.exports.update = Joi.object({
  id: Joi.string().guid().required(),
  organization: Joi.object({
    name: Joi.string(),
  }),
})
