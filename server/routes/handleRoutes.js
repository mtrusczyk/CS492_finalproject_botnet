const express = require('express')
const debug = require('debug')('server:handleRoutes')
const chalk = require('chalk')

const routes = express.Router()

let botCount = 0
let botIPs = []

function middleware(req, res, next) {
  next()
}

function router() {
  routes.use(middleware)

  async function landing (req, res) {
    const { ip } = req.params

    let exists = botIPs.find(existingIP => existingIP === ip)
    if (exists) {
      debug(`${chalk.redBright('Bot already exists')}`)
    } else {
      debug(`New Bot': ${chalk.green(ip)}`)
      botCount++
      botIPs.push(ip)    
      debug(`Count: ${botCount}`)
      debug(`Bots: ${botIPs}`)
    }
    try {
      res.sendStatus(200)
    } catch (err) {
      console.log(err)
    }
  }

  async function admin (req, res) {
    try {
      res.render('admin', {
        count: botCount,
        botIPs: botIPs
      })
    } catch (err) {
      console.log(err)
    }
  }

  routes.get('/landing/:ip', landing)
  routes.get('/admin', admin)

  return routes
}

module.exports = router()