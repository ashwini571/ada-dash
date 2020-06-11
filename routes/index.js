const express = require('express')
const router = express.Router()
const sqliteDb = require('../src/utils/sqlite_connect')
const redshift = require('../src/utils/redshift_connect')
const redshiftClient = redshift.redshiftClient
const clusterName = redshift.clusterName
const chalk = require('chalk')
/* Middleware for getting POST body data */
const bodyParser = require('body-parser')
const urlencodedParser = bodyParser.urlencoded({ extended: false })

const validateSql = require('../src/utils/functions').validateSql
const paginate = require('express-paginate')
const app = express()



/* GET, home page. */
router.get('/',paginate.middleware(9,50),(req, res, next)=>{
  sqliteDb.get(`SELECT COUNT(*) as total_count FROM analytics_cases`, (err,row)=>{
      if(err)
          console.log(chalk.yellow("Error-Sqlite:"+err))
      const totalCount = row.total_count
      const pageCount = Math.ceil(totalCount / req.query.limit)

      let sql = `SELECT id,title FROM analytics_cases LIMIT ? OFFSET ?`
      sqliteDb.all(sql, [req.query.limit, req.skip], (error,rows)=>{
          if(error)
            console.log(chalk.yellow("Error-Sqlite:"+error))
          res.render('templates/index',{error:"Something went wrong!", result:rows, title:'Home',clusterName:clusterName,pages: paginate.getArrayPages(req)( 4,pageCount, req.query.page)
          ,next_pages: paginate.hasNextPages(req)(pageCount)})
      })
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
      if(error  || (result.rows!==undefined && result.rows.length===0)) {
          console.log(chalk.red("Error-redshift:"+error))
          res.render('templates/add_usecase', {title: 'Add Usecase', error: ["Table does not exist!"]})
      }
      else{
        /* Saving column_names in sqlite table */
          let columnNames = Array.prototype.map.call(result.rows, function(item) { return item.column_name; }).join(",")
          let sql = `INSERT INTO analytics_cases(id,title,tablename,table_columns) VALUES(?,?,?,?)`
          sqliteDb.run(sql,[req.body.id, req.body.title, req.body.tablename, columnNames],(err)=>{

              if(err){
                  console.log(chalk.yellow("Error-sqlite:"+err))
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
    if(err)
      console.log(chalk.yellow("Error-sqlite:"+err))
    res.render('templates/index',{error:err, result:rows, title:'Search Results',clusterName:clusterName})
  })
})

router.get('/run_query', (req,res)=>{
    res.render('templates/run_query',{title:'Run', clusterName:clusterName})
})

router.post('/run_query', urlencodedParser, (req,res)=>{

  let query = req.body.query
  if(!validateSql(query))
     return res.send({error:"Only select statements are allowed!"})
  redshiftClient.query(query, (error,result)=>{
    if(error)
      res.send({error:error})
    else if(result.rows.length==0)
      res.send({error:"No data found"})
    else
      res.send({rows:JSON.stringify(result.rows), fields:JSON.stringify(result.fields)})
  })
})

module.exports = router
