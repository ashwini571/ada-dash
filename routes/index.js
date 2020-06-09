const express = require('express')
const router = express.Router()
const sqliteDb = require('../src/utils/sqlite_connect')
const redshift = require('../src/utils/redshift_connect')
const redshiftClient = redshift.redshiftClient
const clusterName = redshift.clusterName
/* Middleware for getting POST body data */
const bodyParser = require('body-parser')
const urlencodedParser = bodyParser.urlencoded({ extended: false })
const validateSql = require('../src/utils/functions').validateSql

/* GET, home page. */
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

/* POST, Adding Use cases */
router.post('/add',urlencodedParser,(req,res)=>{
  let query = `SELECT column_name FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = $1`

  redshiftClient.parameterizedQuery(query, [req.body.tablename],(error,result)=> {
      /* Checks for error and empty rows */
      if(error  || (result.rows!==undefined && result.rows.length===0))
        res.render('templates/add_usecase', {title: 'Add Usecase', error:["Table does not exist!"]})
      else{
        /* Saving column_names in sqlite table */
          let columnNames = Array.prototype.map.call(result.rows, function(item) { return item.column_name; }).join(",")
          let sql = `INSERT INTO analytics_cases(id,title,tablename,table_columns) VALUES(?,?,?,?)`
          sqliteDb.run(sql,[req.body.id, req.body.title, req.body.tablename, columnNames],(err)=>{
              console.log(err)
              if(err){
                  let error
                  if(err.errno === 19)
                      error = ["Id is already taken!"]
                  else
                      error = [err]
                  res.render('templates/add_usecase',{title:'Add Usecase', error:error})
              }
              else{
                  /* Calling the Add_query function */
                  req.params.id = req.body.id
                  res.render('templates/config_usecase/add_query', {title: 'Add Query', message:["Created Successfully"], usecase_id: req.body.id})
              }
          })
      }
  })
})

router.get('/redshift_config', (req,res)=>{
  res.render('templates/edit_redshift_config',{title:'Redshift Config.'})
})

/*GET, Search for usecases */
router.get('/search', (req,res)=>{
  let sql = `SELECT * FROM analytics_cases WHERE title LIKE '%${req.query.key}%' OR id =?`
  sqliteDb.all(sql,[req.query.key],(err,rows)=>{
      console.log(err)
    res.render('templates/index',{error:err, result:rows, title:'Search Results',clusterName:clusterName})
  })
})

router.get('/run_query', (req,res)=>{
    res.render('templates/run_query',{title:'Run', clusterName:clusterName})
})

router.post('/run_query', urlencodedParser, (req,res)=>{

  let query = req.body.query
  if(!validateSql(query))
     return res.send({error:"This sql is not permitted!"})
  redshiftClient.query(query, (error,result)=>{
    console.log(result)
    if(error)
      res.send({error:error})
    else if(result.rows.length==0)
      res.send({error:"No data found"})
    else
      res.send({rows:JSON.stringify(result.rows), fields:JSON.stringify(result.fields)})
  })
})

module.exports = router
