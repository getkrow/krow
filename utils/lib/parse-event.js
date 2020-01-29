const parseEvent = (event) => ({
  body: JSON.parse(event.body),
  query: event.pathParameters
})

module.exports = parseEvent
