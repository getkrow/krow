const Joi = require('@hapi/joi')

module.exports.create = Joi.object({
  email: Joi.string().email().required(),
})

module.exports.get = Joi.object({
  id: Joi.string().guid().required(),
})

module.exports.update = Joi.object({
  id: Joi.string().guid().required(),
  user: Joi.object({
    email: Joi.string().email(),
  }),
})
