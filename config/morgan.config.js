const chalk = require('chalk')

module.exports = (tokens, req, res) => {
  return [
    tokens.method(req, res),
    tokens.url(req, res),
    chalk.green(tokens.status(req, res)),
    tokens.res(req, res, 'content-length'), '-',
    tokens['response-time'](req, res), 'ms'
  ].join(' ')
}