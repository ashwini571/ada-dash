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

/* GET Adding Use cases */
router.get('/add',(req,res)=>{
  res.render('templates/add_usecase',{title:'Add'})
})
/* POST Adding Use cases */
router.post('/add',urlencodedParser,(req,res)=>{

  let sql = `INSERT INTO analytics_cases(id,title) VALUES("${req.body.id}","${req.body.title}")`

  sqliteDb.run(sql,[],(err)=>{
    console.log(err)
    if(err)
      res.render('templates/add_usecase',{title:'Add', error:err})
    else
      res.render('templates/add_usecase',{title:'Add', msg:"Added Successfully"})
  })


})

module.exports = router
