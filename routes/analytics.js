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

const decideTimeDependency = (row)=>{
   row.forEach((element)=>{
       if(element.query.search("\\$timePeriod")!==-1)
           element.time_dependent = 1
       else
           element.time_dependent = 0
   })
}

/* GET,  Shows Options For Different Types of Query at Analytics Page */
router.get('/:usecase_id', (req, res, )=> {
    /* fetching all cases from sqlite */
    let sql = `SELECT aq.id,ac.id as usecase_id, ac.title as usecase_title,ac.tablename, aq.title as query_title, aq.type,
    aq.query FROM analytics_cases as ac INNER JOIN all_queries as aq ON ac.id="${req.params.usecase_id}" AND aq.usecase_id="${req.params.usecase_id}" `
    sqliteDb.all(sql,[],(err,row)=>{
        /* row.length==0 so that it doesn't catch error in  row[0].usecase_title*/
        if (err) {
            res.render('templates/analytics', {title: "Error", error: "Error querying Sqlite",id:req.params.usecase_id})
        }
        else if(row.length === 0){
            res.render('templates/analytics', {error: "No queries found",id:req.params.usecase_id})
        }
        else{
            /*Extracting variables from query enclosed under "{ }" */
            extractVar(row)
            decideTimeDependency(row)
            console.log(row)
            res.render('templates/analytics', {title: row[0].usecase_title, clusterName: clusterName, result: row, id:req.params.usecase_id})
        }
    })
})

/* POST,  Getting data according to the type of query selected */
router.post('/getData', urlencodedParser, (req,res)=>{
    /* getting data from request body */
    let id = req.body.id
    let usecase_id = req.body.usecase_id
    let input = req.body.input
    let timePeriod = Number(req.body.timePeriod)

    /* brings redshift query from sqlite */
    let sql = `SELECT * FROM all_queries WHERE id='${id}'`
    sqliteDb.get(sql,[],(err,row)=>{

        if(err || isNaN(timePeriod) || timePeriod<0 || timePeriod>180)
            res.send({error:"Something went wrong!"})
        else if(row===undefined)
            res.send({error:"No data found"})
        else {
            let queryRedshift = row.query
            let key = usecase_id+"_"+id+"_"+timePeriod
            /* Adding User input to the query */
            if(row.type === 'filter')
                queryRedshift = userInputToQuery(queryRedshift,input)

            queryRedshift = queryRedshift.replace("$timePeriod",timePeriod)
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
                        res.send({rows: JSON.stringify(result.rows),last_fetched:row.last_fetched,help:row.help})
                    }
                })

            }
            else{
                console.log("from_cache")
                res.send({rows:JSON.stringify(cachedData),last_fetched:row.last_fetched,help:row.help})
            }
        }
    })
})

module.exports = router
