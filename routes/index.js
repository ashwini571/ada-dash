const express = require('express')
const router = express.Router()
const sqliteDb = require('../src/utils/sqlite_connect')
const redshift = require('../src/utils/redshift_connect')
const redshiftClient = redshift.redshiftClient
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

/* GET Form for adding  usecase */
router.get('/add',(req,res)=>{
  res.render('templates/add_usecase',{title:'Add Usecase', clusterName:clusterName})
})

/* POST Adding Use cases */
router.post('/add',urlencodedParser,(req,res)=>{

  let sql = `INSERT INTO analytics_cases(id,title,tablename) VALUES("${req.body.id}","${req.body.title}","${req.body.tablename}")`
  sqliteDb.run(sql,[],(err)=>{
    console.log(err)
    if(err)
      res.render('templates/add_usecase',{title:'Add Usecase', error:err})
    else {
      /* Calling the Add_query function */
      req.params.id = req.body.id
      res.render('templates/config_usecase/add_query', {title: 'Add Query', msg: "Created Successfully", usecase_id: req.body.id})
    }
  })
})

router.get('/redshift_config', (req,res)=>{
  res.render('templates/edit_redshift_config',{title:'Redshift Config.'})
})

/*GET Search for usecases */
router.get('/search', (req,res)=>{

  let sql = `SELECT * FROM analytics_cases WHERE title LIKE '%${req.query.key}%' OR id LIKE '${req.query.key}' `

  sqliteDb.all(sql,(err,rows)=>{
    console.log(rows.length)
    res.render('templates/index',{error:err, result:rows, title:'Search Results',clusterName:clusterName})
  })
})

router.get('/run_query', (req,res)=>{
    res.render('templates/run_query',{title:'Run', clusterName:clusterName})
})

router.post('/run_query', urlencodedParser, (req,res)=>{

  let query = req.body.query
  console.log(query)
  redshiftClient.query(query, (error,result)=>{
    console.log(result)
    if(error)
      res.send({error:"Something went wrong"})
    else if(result.rows.length==0)
      res.send({error:"No data found"})
    else
      res.send({rows:JSON.stringify(result.rows), fields:JSON.stringify(result.fields)})
  })
})

module.exports = router
