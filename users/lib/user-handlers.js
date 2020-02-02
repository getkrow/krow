const { dynamoDbClient, dynamoDbUtils, parseEvent, createResponse } = require('@krow/utils')
const schemas = require('./user-schemas')

const { getById, getAll, createWithMeta, update, del } = dynamoDbUtils

module.exports.get = async (event, context) => {
  const { id } = parseEvent(event).query

  const { error } = schemas.get.validate({ id })

  if (error) return createResponse(400, { error: error.message })

  try {
    const user = await getById(id)
    return createResponse(200, { user })
  } catch (error) {
    return createResponse(error.statusCode || 501, { message: error.message })
  }
}

module.exports.list = async (event, context) => {
  try {
    const users = await getAll()
    return createResponse(200, { users })
  } catch (error) {
    return createResponse(error.statusCode || 501, { message: error.message })
  }
}

module.exports.create = async (event, context) => {
  const { body } = parseEvent(event)

  const { error } = schemas.create.validate(body)

  if (error) return createResponse(400, { error: error.message })

  try {
    const user = await createWithMeta({ email })
    return createResponse(201, { user })
  } catch (error) {
    return createResponse(error.statusCode || 501, { message: error.message })
  }
}

module.exports.update = async (event, context) => {
  const { body: partialUser, query } = parseEvent(event)
  const { id } = query

  const { error } = schemas.update.validate({ id, user: partialUser })

  if (error) return createResponse(400, { error: error.message })

  try {
    const user = await update(id, partialUser)
    return createResponse(200, { user })
  } catch (error) {
    return createResponse(error.statusCode || 501, { error: error.message })
  }
}

module.exports.delete = async (event, context) => {
  const { id } = parseEvent(event).query

  try {
    await del(id)
    return createResponse(204, null)
  } catch (error) {
    return createResponse(error.statusCode || 501, { error: error.message })
  }
}
