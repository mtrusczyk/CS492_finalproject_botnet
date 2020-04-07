const express = require('express')
const chalk = require('chalk')
var debug = require('debug')('server')
const path = require('path')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
// const session = require('express-session')
const cors = require('cors')

const landing = require('./routes/landing')

const server = express()
const port =  3030

server.use(cors())
server.use(bodyParser.json())
server.use(bodyParser.urlencoded({ extended: false }))
server.use(cookieParser())

server.use(express.static(path.join(__dirname, '/public/')))

//views to use if we're displaying anything in the brower from this url (localhost:3030)
server.set('views', './views')
server.set('view engine', 'ejs')

server.use('/landing', landing)

server.get('/', (req, res) => {
})

server.listen(port, () => {
  debug(`listening on port ${chalk.green(port)}`)
})
module.exports = server;