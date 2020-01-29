const createResponse = (code, body) => {
  return {
    statusCode: code,
    body: JSON.stringify(body)
  }
}

module.exports = createResponse
