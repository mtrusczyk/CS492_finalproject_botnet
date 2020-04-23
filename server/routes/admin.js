const express = require('express')
const debug = require('debug')('server:admin')

const admin = express.Router()

function middleware(req, res, next) {
  next()
}

function router() {
  admin.use(middleware)

  async function adminPage (req, res) {
    try {
      res.render('admin', {})
    } catch (err) {
      console.log(err)
    }
  }

  admin.get('/', adminPage)

  return admin
}

module.exports = router()
