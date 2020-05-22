const express = require('express')
const router = express.Router()
const redshift = require('../src/utils/redshift_connect')
const sqliteDb = require('../src/utils/sqlite_connect')

/* Middleware for getting POST body data */
const bodyParser = require('body-parser')
const urlencodedParser = bodyParser.urlencoded({ extended: false })

const redshiftClient = redshift.redshiftClient
const clusterName = redshift.clusterName

router.get('/:id', (req, res )=> {

    /* fetching all cases from sqlite */
    let sql = `SELECT * FROM all_queries WHERE usecase_id = '${req.params.id}' `
    sqliteDb.all(sql,[],(err,row)=>{
        /* row.length==0 so that it doesn't catch error in  row[0].title*/
        if(err || row.length==0)
            return res.render('templates/all_queries',{title:"Error",error:"Error querying Sqlite"})

        res.render('templates/all_queries', { title:"All Queries", clusterName:clusterName,result:row })

    })
})



module.exports = router