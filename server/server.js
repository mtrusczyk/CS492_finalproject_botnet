// BotNet command server configuration

// Imported modules used in server
const express = require('express')
const chalk = require('chalk')
const debug = require('debug')('server')
const path = require('path')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const useragent = require('express-useragent')

// Imported files used to configure server
const handleRoutes = require('./routes/handleRoutes')

// Initializing express server
const server = express()

// Seeting port variable for server
const port =  3030

// Configuring server middleware
server.use(cors())
server.use(bodyParser.json())
server.use(bodyParser.urlencoded({ extended: false }))
server.use(cookieParser())
server.use(useragent.express())

// Configuring location of static css and javascript files
server.use('/public', express.static(path.join(__dirname, '/public/')))

// Configuring location of html pages and the view engine we're using
server.set("views", path.join(__dirname, "views"));
server.set("view engine", "pug");

// Configuring the routes as an endpoint is hit.  
// All routes will be sent to the handleRoutes file
server.use('/', handleRoutes)

// Starting the server to listen on the port variable defined above (3030)
server.listen(port, () => {
  debug(`listening on port ${chalk.green(port)}`)
})
module.exports = server;