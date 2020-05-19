const express = require('express')
const router = express.Router()
const redshift = require('../src/utils/redshift_connect')
const sqliteDb = require('../src/utils/sqlite_connect')

/* Middleware for getting POST body data */
const bodyParser = require('body-parser')
const urlencodedParser = bodyParser.urlencoded({ extended: false })

const redshiftClient = redshift.redshiftClient
const clusterName = redshift.clusterName

/* GET  query from redshift */
router.get('/:id', (req, res, )=> {

    /* fetching all cases from sqlite */
    let sql = `SELECT ac.id, ac.title as usecase_title, aq.title as query_title, aq.type FROM analytics_cases as ac INNER JOIN all_queries as aq ON ac.id="${req.params.id}" AND aq.usecase_id="${req.params.id}" `
    sqliteDb.all(sql,[],(err,row)=>{
        /* row.length==0 so that it doesn't catch error in  row[0].title*/
        console.log(row)
        if(err || row.length==0)
            return res.render('templates/analytics',{title:"Error",Error:err})

        res.render('templates/analytics', { title:row[0].usecase_title, clusterName:clusterName,result:row })

    })

})

/* Getting data according to the type of query selected */
router.post('/getData', urlencodedParser, (req,res)=>{

    let usecase_id = req.body.usecase_id
    let title = req.body.title
    let type = req.body.type
    let input = req.body.input
    console.log(req.body)
    /* brings redshift query from sqlite */
    let sql = `SELECT query,last_fetched FROM all_queries WHERE usecase_id='${usecase_id}' AND title='${title}'`
    sqliteDb.get(sql,[],(err,row)=>{
        if(err)
            res.send({error:"Something went wrong!"})
        else if(row==undefined)
            res.send({error:"No data found"})
        else
        {
            let queryForRedshift = row.query
            if(type == 'filter')
                queryForRedshift = queryForRedshift.replace("$input",input)
            console.log(queryForRedshift)
            redshiftClient.query(queryForRedshift, (error,result)=>{
                console.log(result)
               if(result.rows.length==0)
                   res.send({error:"No data found"})
               else
                   res.send({rows:JSON.stringify(result.rows), fields:JSON.stringify(result.fields)})
            })
        }
    })
})

module.exports = router
