const express = require('express')
const router = express.Router()
const sqliteDb = require('../src/utils/sqlite_connect')


/* GET home page. */
router.get('/', (req, res, next)=>{

  let sql = `SELECT id,title FROM analytics_cases`;
  sqliteDb.all(sql,(err,rows)=>{
    res.render('templates/index',{error:err, result:rows, title:'Home'})
  })

})

module.exports = router
