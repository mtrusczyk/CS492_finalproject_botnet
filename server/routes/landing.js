const express = require('express')
const debug = require('debug')('server:landing')

const landing = express.Router()

function middleware(req, res, next) {
  next()
}

function router() {
  landing.use(middleware)

  async function landingPlan (req, res) {
    const { ip } = req.params
    debug(`New Bot: ${ip}`)
    try {
      res.sendStatus(200)
    } catch (err) {
      console.log(err)
    }
  }

  landing.get('/:ip', landingPlan)

  return landing
}

module.exports = router()
