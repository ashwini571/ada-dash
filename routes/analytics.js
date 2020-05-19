const express = require('express')
const router = express.Router()
const redshift = require('../src/utils/redshift_connect')
const sqliteDb = require('../src/utils/sqlite_connect')


const redshiftClient = redshift.redshiftClient
const clusterName = redshift.clusterName

/* GET  query from redshift */
router.get('/:id', (req, res, )=> {

    /* fetching all cases from sqlite */
    let sql = `SELECT ac.title,aq.type,aq.query,aq.last_fetched FROM analytics_cases as ac INNER JOIN all_queries as aq ON ac.id="${req.params.id}" AND aq.usecase_id="${req.params.id}" `
    sqliteDb.all(sql,[],(err,row)=>{

        if(err || row.length==0)
            return res.render('templates/analytics',{title:"Error",Error:err})

        res.render('templates/analytics', { title:row[0].title, clusterName:clusterName})

    })

})
module.exports = router
