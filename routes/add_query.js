const express = require('express')
const router = express.Router()
const redshift = require('../src/utils/redshift_connect')
const sqliteDb = require('../src/utils/sqlite_connect')

/* Middleware for getting POST body data */
const bodyParser = require('body-parser')
const urlencodedParser = bodyParser.urlencoded({ extended: false })

const redshiftClient = redshift.redshiftClient
const clusterName = redshift.clusterName

router.get('/:id', (req,res)=>{
res.render('templates/add_query')
})

router.post('/:id', (req,res)=>{
res.render('templates/add_query')
})

module.exports = router