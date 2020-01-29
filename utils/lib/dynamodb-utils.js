const { compose, merge, assoc, reduce, append, keys, join } = require('ramda')
const moment = require('moment')
const uuid = require('uuid/v4')
const dynamoDbClient = require('./dynamodb-client')

const baseParams = {
  TableName: process.env.TABLE_NAME
}

const TIMESTAMP_FORMAT = 'YYYY-MM-DDTHH:mm:ssZ'

const addId = assoc('id', uuid())
const addCreatedAt = assoc('createdAt', moment().format(TIMESTAMP_FORMAT))
const addUpdatedAt = assoc('updatedAt', moment().format(TIMESTAMP_FORMAT))

const addTimestamps = compose(addUpdatedAt, addCreatedAt)
const addMeta = compose(addId, addTimestamps)

const constructUpdateParams = (data) => {
  const updateExpressionArr = reduce((acc, key) => append(`#${key} = :${key}`, acc), [], keys(data))
  const UpdateExpression = `SET ${join(', ', updateExpressionArr)}`
  const ExpressionAttributeNames = reduce((acc, key) => assoc(`#${key}`, key, acc), {}, keys(data))
  const ExpressionAttributeValues = reduce((acc, key) => assoc(`:${key}`, data[key], acc), {}, keys(data))
  return { UpdateExpression, ExpressionAttributeNames, ExpressionAttributeValues }
}

module.exports.getById = async (id) => {
  const params = merge(baseParams, {
    Key: { id }
  })

  try {
    const { Item: item = {} } = await dynamoDbClient.get(params).promise()
    return item
  } catch (error) {
    throw new Error(error)
  }
}

module.exports.getAll = async () => {
  const params = baseParams

  try {
    const { Items: items = [] } = await dynamoDbClient.scan(params).promise()
    return items
  } catch (error) {
    throw new Error(error)
  }
}

module.exports.createWithMeta = async (data) => {
  const item = addMeta(data)

  const params = merge(baseParams, {
    Item: item
  })

  try {
    await dynamoDbClient.put(params).promise()
    return item
  } catch (error) {
    throw new Error(error)
  }
}

module.exports.update = async (id, data) => {
  const partialItem = addUpdatedAt(data)

  const { UpdateExpression, ExpressionAttributeNames, ExpressionAttributeValues } = constructUpdateParams(partialItem)

  const getParams = merge(baseParams, {
    Key: { id }
  })
  const updateParams = merge(baseParams, {
    Key: { id },
    UpdateExpression,
    ExpressionAttributeNames,
    ExpressionAttributeValues,
  })

  try {
    const { Item: item } = await dynamoDbClient.get(getParams).promise()
    if (!item) throw new Error(`Entity with id ${id} does not exist.`)
    await dynamoDbClient.update(updateParams).promise()
    return merge(item, partialItem)
  } catch (error) {
    throw new Error(error)
  }
}

module.exports.del = async (id) => {
  const params = merge(baseParams, {
    Key: { id }
  })

  try {
    await dynamoDbClient.delete(params).promise()
    return null
  } catch (error) {
    throw new Error(error)
  }
}
