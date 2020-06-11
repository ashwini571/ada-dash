const express = require('express')
const router = express.Router()
const redshift = require('../src/utils/redshift_connect')
const functions = require('../src/utils/functions')
const sqliteDb = require('../src/utils/sqlite_connect')
const chalk = require('chalk')
/* Data-Caching */
const nodeCache = require('node-cache')
const myCache = new nodeCache()

/* Middleware for getting POST body data */
const bodyParser = require('body-parser')
const urlencodedParser = bodyParser.urlencoded({ extended: false })

const redshiftClient = redshift.redshiftClient
const clusterName = redshift.clusterName

/* from functions.js */
const userInputToQuery = functions.userInputToQuery
const extractVar = functions.extractVar
const decideTimeDependency = functions.decideTimeDependency
const validateSql = functions.validateSql

/* GET,  Shows Options For Different Types of Query and plots at Analytics Page */
router.get('/:usecase_id', (req, res )=> {
    let error = [],title,countTimeDependency = 0
    /*Verifiying usecase id */
    sqliteDb.get(`SELECT * FROM analytics_cases WHERE id=?`, [req.params.usecase_id], (err,row)=>{
        if(err || (row===undefined)) {
            console.log(chalk.yellow("Error-sqlite: "+err))
            return res.render('templates/error')
        }
        else{
            title = row.title
            /* fetching all queries from sqlite */
            let sqlForQueries = `SELECT aq.id,ac.id as usecase_id, ac.title as usecase_title,ac.tablename, aq.title as query_title, aq.type,aq.query FROM analytics_cases as ac INNER JOIN all_queries as aq ON ac.id=? AND aq.usecase_id=? `
            /* fetching all plots from sqlite */
            let sqlForPlots = `SELECT ap.id,ap.usecase_id,ap.query,ap.title,ap.x_axis,ap.y_axis FROM analytics_cases as ac INNER JOIN all_plots as ap ON ac.id=? AND ap.usecase_id=? `

            sqliteDb.all(sqlForQueries,[req.params.usecase_id, req.params.usecase_id],(errQuery,resQuery)=>{
                if (errQuery) {
                    console.log(chalk.yellow("Error-sqlite: "+errQuery))
                    error.push("Error rendering queries")
                }
                else {
                    /*Extracting variables from query enclosed under "{ }" */
                    extractVar(resQuery)
                    countTimeDependency += decideTimeDependency(resQuery)
                }
                sqliteDb.all(sqlForPlots,[req.params.usecase_id, req.params.usecase_id],(errPlot,resPlot)=>{
                    if(errPlot) {
                        console.log(chalk.yellow("Error-sqlite: "+errPlot))
                        error.push("Error rendering plots")
                    }
                    else
                        countTimeDependency += decideTimeDependency(resPlot)
                    res.render('templates/analytics', {clusterName: clusterName,title:title,error:error,countTimeDependency:countTimeDependency, resQuery:resQuery,resPlot:resPlot, usecase_id:req.params.usecase_id})
                })
            })
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
    let queryType = req.body.type
    let cacheReset = req.body.cacheReset
    /* brings redshift query from sqlite */
    let sql = `SELECT * FROM all_queries WHERE id=?`
    sqliteDb.get(sql,[id],(err,row)=>{
        if(err) {
            console.log(chalk.yellow("Error-sqlite: "+ err))
            res.send({error: err})
        }
        else if(isNaN(timePeriod) || timePeriod<0 || timePeriod>180)
            res.send({error:"Only values from 1 to 180 are allowed"})
        else if(row===undefined)
            res.send({error:"No data found"})
        else {
            let queryRedshift = row.query
            if(!validateSql(queryRedshift))
                return res.send({error:"Only select statements are allowed!"})
            let key = usecase_id+"_"+id+"_"+timePeriod
            console.log(chalk.magenta("Cache-Key: "+key))
            /* Adding User input to the query */
            if(row.type === 'filter')
                queryRedshift = userInputToQuery(queryRedshift,input)
            /* Adding user input time Period */
            queryRedshift = queryRedshift.replace(/\$timePeriod/g,timePeriod)
            let cachedData =  queryType!=='filter'?myCache.get(key):undefined
            if(cachedData === undefined || cacheReset === 1) {

                redshiftClient.query(queryRedshift, (error,result)=>{
                    if(error) {
                        console.log(chalk.red("Error-redshift: "+ error))
                        res.send({error: error})
                    }
                    else if(result.rows.length===0)
                        res.send({error:"No data found"})
                    else {
                       let currTime = new Date().toISOString().split('.')[0]
                        console.log(chalk.green("Current_time: "+currTime))
                        /* Updating last-fetched timing */
                       sqliteDb.run(`UPDATE all_queries SET last_fetched = '${currTime}' WHERE id = ${id}`,(errUpdate)=>{
                           if(errUpdate) {
                               console.log(chalk.yellow("Error-sqlite: "+errUpdate))
                               res.send({error: "Something went wrong"})
                           }
                           else{
                               console.log(chalk.magenta("Data: "+"From Redshift"))
                               myCache.set(key,result.rows,86400)
                               res.send({rows: JSON.stringify(result.rows),last_fetched:currTime})
                           }
                       })
                    }
                })
            }
            else{
                console.log(chalk.magenta("Data: "+"From Cache"))
                res.send({rows:JSON.stringify(cachedData),last_fetched:row.last_fetched})
            }
        }
    })
})

router.post('/getPlotData', urlencodedParser, (req,res)=>{
    /* getting data from request body */
    let id = req.body.id
    let usecase_id = req.body.usecase_id
    let timePeriod = Number(req.body.timePeriod)
    let cacheReset = req.body.cacheReset
    /* brings redshift query from sqlite */
    let sql = `SELECT * FROM all_plots WHERE id=?`
    sqliteDb.get(sql,[id],(err,row)=>{
        if(err) {
            console.log(chalk.yellow("Error-sqlite: "+ err))
            res.send({error: err})
        }
        else if(isNaN(timePeriod) || timePeriod<0 || timePeriod>180) {
            console.log(chalk.yellow("Error-sqlite: "+err))
            res.send({error: "Something went wrong!"})
        }
        else if(row===undefined)
            res.send({error:"No data found"})
        else {
            let queryRedshift = row.query
            if(!validateSql(queryRedshift))
                return res.send({error:"Only select statements are allowed!"})
            let key = usecase_id+"$"+id+"$"+timePeriod
            console.log(chalk.magenta("Cache-Key: "+key))
            queryRedshift = queryRedshift.replace(/\$timePeriod/g,timePeriod)
            let cachedData =  myCache.get(key)
            if(cachedData === undefined || cacheReset === 1) {

                redshiftClient.query(queryRedshift, (error,result)=>{
                    if(error) {
                        console.log(chalk.red("Error-redshift: "+ error))
                        res.send({error: error})
                    }
                    else if(result.rows.length===0)
                        res.send({error:"No data found"})
                    else {
                        let currTime = new Date().toISOString().split('.')[0]
                        console.log(chalk.green("Current_time: "+currTime))
                        /* Updating last-fetched timing */
                        sqliteDb.run(`UPDATE all_plots SET last_fetched = '${currTime}' WHERE id = ${id}`,(errUpdate)=>{
                            if(errUpdate) {
                                console.log(chalk.yellow("Error-sqlite: "+errUpdate))
                                res.send({error: "Something went wrong"})
                            }
                            else{
                                console.log(chalk.magenta("Data From Redshift"))
                                myCache.set(key,result.rows,86400)
                                res.send({rows: JSON.stringify(result.rows),last_fetched:currTime,x_axis:row.x_axis,y_axis:row.y_axis})
                            }
                        })
                    }
                })
            }
            else{
                console.log(chalk.magenta("Data From Cache"))
                res.send({rows:JSON.stringify(cachedData),last_fetched:row.last_fetched,x_axis:row.x_axis,y_axis:row.y_axis})
            }
        }
    })
})

module.exports = router
