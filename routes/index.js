const express = require('express')
const router = express.Router()
const sqliteDb = require('../src/utils/sqlite_connect')

/* Middleware for getting POST body data */
const bodyParser = require('body-parser')
const urlencodedParser = bodyParser.urlencoded({ extended: false })


/* GET home page. */
router.get('/', (req, res, next)=>{

  let sql = `SELECT id,title FROM analytics_cases`;
  sqliteDb.all(sql,(err,rows)=>{
    res.render('templates/index',{error:err, result:rows, title:'Home'})
  })

})

/* Adding Use cases */
router.get('/add',(req,res)=>{
  res.render('templates/add_usecase',{title:'Add'})
})

router.post('/add',urlencodedParser,(req,res)=>{
  let sql = `INSERT INTO analytics_cases(id,title,query) VALUES(${req.body.id},${req.body.title},${req.body.query})`

  sqliteDb.run(sql,[],(err)=>{
    console.log(err)
    if(err)
      res.render('templates/add_usecase',{title:'Add', error:"Unable to Add"})
    else
      res.render('templates/add_usecase',{title:'Add', msg:"Successfully Added"})
  })


})

module.exports = router
