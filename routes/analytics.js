const express = require('express')
const router = express.Router()
const redshiftClient = require('../src/utils/redshift_connect')
const sqliteDb = require('../src/utils/sqlite_connect')

/* GET  query from redshift */
router.get('/:id', (req, res, )=> {

    /* fetching all cases from sqlite */
    let sql = `SELECT query FROM analytics_cases WHERE id="${req.params.id}" `
    sqliteDb.get(sql,[],(err,row)=>{
        if(err)
            return res.render('templates/anayltics',{title:"Error", error:err})
        let queryStr = row.query
        // execute query and invoke callback...
        redshiftClient.query(queryStr,(error,result)=>{
            if(err)
                res.render('templates/anayltics',{title:"Error", error:error})
            else
                res.render('templates/analytics', { title: 'Analytics',result:JSON.stringify(result.rows)})
        })
    })

})

module.exports = router
