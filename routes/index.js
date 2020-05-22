const express = require('express')
const router = express.Router()
const sqliteDb = require('../src/utils/sqlite_connect')
const redshift = require('../src/utils/redshift_connect')
const clusterName = redshift.clusterName
/* Middleware for getting POST body data */
const bodyParser = require('body-parser')
const urlencodedParser = bodyParser.urlencoded({ extended: false })


/* GET home page. */
router.get('/', (req, res, next)=>{

  let sql = `SELECT id,title FROM analytics_cases`;
  sqliteDb.all(sql,(err,rows)=>{
    res.render('templates/index',{error:err, result:rows, title:'Home',clusterName:clusterName})
  })

})

/* GET Adding Use cases */
router.get('/add',(req,res)=>{
  res.render('templates/add_usecase',{title:'Add Usecase'})
})

/* POST Adding Use cases */
router.post('/add',urlencodedParser,(req,res)=>{

  let sql = `INSERT INTO analytics_cases(id,title) VALUES("${req.body.id}","${req.body.title}")`

  sqliteDb.run(sql,[],(err)=>{
    console.log(err)
    if(err)
      res.render('templates/add_usecase',{title:'Add Usecase', error:err})
    else {
      /* Calling the Add_query function */
      req.params.id = req.body.id
      res.render('templates/add_query', {title: 'Add Query', msg: "Created Successfully", usecase_id: req.body.id})
    }
  })

})

router.get('/redshift_config', (req,res)=>{
  res.render('templates/edit_redshift_config',{title:'Redshift Config.'})
})

router.get('/search', (req,res)=>{

  let sql = `SELECT * FROM analytics_cases WHERE title LIKE '%${req.query.key}%' OR id LIKE '${req.query.key}' `

  sqliteDb.all(sql,(err,rows)=>{
    console.log(rows.length)
    res.render('templates/index',{error:err, result:rows, title:'Search Results',clusterName:clusterName})
  })
})


module.exports = router
