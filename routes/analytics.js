const express = require('express')
const router = express.Router()
const redshift = require('../src/utils/redshift_connect')
const sqliteDb = require('../src/utils/sqlite_connect')
/* Data-Caching */
const nodeCache = require('node-cache')
const myCache = new nodeCache()

/* Middleware for getting POST body data */
const bodyParser = require('body-parser')
const urlencodedParser = bodyParser.urlencoded({ extended: false })

const redshiftClient = redshift.redshiftClient
const clusterName = redshift.clusterName

/* Utility function for extracting words enclosed under {} */
const extractVar = (row)=>{
    row.forEach((element)=>{
        let inputVar = element.query.match(/{[\w]+}/g)
        if(inputVar != null) {
            /* Removing { and } from the string */
            for(let e in inputVar)
                inputVar[e] = inputVar[e].slice(1,-1)
            element.inputVar = inputVar
        }
        else
            element.inputVar = []
    })
}
/*Inserting user input values to SQL query for filtering */
const userInputToQuery = (query,input)=>{

    for(let obj in input) {
       query = query.replace("{"+input[obj].nameOfInput+"}",input[obj].valueOfInput)
    }
    return query
}

/* GET  Shows Options For Different Types of Query at Analytics Page */
router.get('/:id', (req, res, )=> {
    /* fetching all cases from sqlite */
    let sql = `SELECT aq.id,ac.id as usecase_id, ac.title as usecase_title,ac.time_period, aq.title as query_title, aq.type,aq.query FROM analytics_cases as ac INNER JOIN all_queries as aq ON ac.id="${req.params.id}" AND aq.usecase_id="${req.params.id}" `
    sqliteDb.all(sql,[],(err,row)=>{
        /* row.length==0 so that it doesn't catch error in  row[0].usecase_title*/
        if (err || row.length === 0) {
            return res.render('templates/analytics', {title: "Error", error: "Error querying Sqlite"})
        } else {
            /*Extracting variables from query enclosed under "{ }" */
            extractVar(row)
            res.render('templates/analytics', {title: row[0].usecase_title, clusterName: clusterName, result: row})
        }
    })
})

/* POST  Getting data according to the type of query selected */
router.post('/getData', urlencodedParser, (req,res)=>{
    let id = req.body.id
    let usecase_id = req.body.usecase_id
    let type = req.body.type
    let input = req.body.input
    let timePeriod = req.body.timePeriod
    console.log(req.body)
    /* brings redshift query from sqlite */
    let sql = `SELECT id,query,last_fetched FROM all_queries WHERE id='${id}'`
    sqliteDb.get(sql,[],(err,row)=>{
        if(err)
            res.send({error:"Something went wrong!"})
        else if(row===undefined)
            res.send({error:"No data found"})
        else {
            let queryRedshift = row.query
            let key = usecase_id+"_"+id
            /* Adding User input to the query */
            if(type === 'filter')
                queryRedshift = userInputToQuery(queryRedshift,input)

            let cachedData = myCache.get(key)
            if(cachedData == undefined) {
                redshiftClient.query(queryRedshift, (error,result)=>{
                    if(error)
                        res.send({error:"Something went wrong"})
                    else if(result.rows.length===0)
                        res.send({error:"No data found"})
                    else {
                        console.log("from_redshift")
                        myCache.set(key,result.rows,86400*timePeriod)
                        res.send({rows: JSON.stringify(result.rows)})
                    }
                })
            }
            else{
                console.log("from_cache")
                res.send({rows:JSON.stringify(cachedData),last_fetched:row.last_fetched})
            }
        }
    })
})

module.exports = router
