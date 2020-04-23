const express = require('express')
const chalk = require('chalk')
var debug = require('debug')('server')
const path = require('path')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
// const session = require('express-session')
const cors = require('cors')
const useragent = require('express-useragent')

const handleRoutes = require('./routes/handleRoutes')
const admin = require('./routes/admin')

const server = express()
const port =  3030

server.use(cors())
server.use(bodyParser.json())
server.use(bodyParser.urlencoded({ extended: false }))
server.use(cookieParser())
server.use(useragent.express())

server.use('/public', express.static(path.join(__dirname, '/public/')))
server.use('/worms', express.static(path.join(__dirname, '/worms/')))

//views to use if we're displaying anything in the brower from this url (localhost:3030)
server.set("views", path.join(__dirname, "views"));
server.set("view engine", "pug");

server.use('/', handleRoutes)

server.listen(port, () => {
  debug(`listening on port ${chalk.green(port)}`)
})
module.exports = server;