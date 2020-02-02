const { dynamoDbClient, dynamoDbUtils, parseEvent, createResponse } = require('@krow/utils')
const schemas = require('./organization-schemas')

const { getById, getAll, createWithMeta, update, del } = dynamoDbUtils

module.exports.get = async (event, context) => {
  const { id } = parseEvent(event).query

  const { error } = schemas.get.validate({ id })

  if (error) return createResponse(400, { error: error.message })

  try {
    const organization = await getById(id)
    return createResponse(200, { organization })
  } catch (error) {
    return createResponse(error.statusCode || 501, { message: error.message })
  }
}

module.exports.list = async (event, context) => {
  try {
    const organizations = await getAll()
    return createResponse(200, { organizations })
  } catch (error) {
    return createResponse(error.statusCode || 501, { message: error.message })
  }
}

module.exports.create = async (event, context) => {
  const { body } = parseEvent(event)

  const { error } = schemas.create.validate(body)

  if (error) return createResponse(400, { error: error.message })

  try {
    const organization = await createWithMeta({ name })
    return createResponse(201, { organization })
  } catch (error) {
    return createResponse(error.statusCode || 501, { message: error.message })
  }
}

module.exports.update = async (event, context) => {
  const { body: partialOrganization, query } = parseEvent(event)
  const { id } = query

  const { error } = schemas.update.validate({ id, organization: partialOrganization })

  if (error) return createResponse(400, { error: error.message })

  try {
    const organization = await update(id, partialOrganization)
    return createResponse(200, { organization })
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
