const express = require('express')
const router = express.Router()
const redshift = require('../src/utils/redshift_connect')
const sqliteDb = require('../src/utils/sqlite_connect')
const chalk = require('chalk')
/* Middleware for getting POST body data */
const bodyParser = require('body-parser')
const urlencodedParser = bodyParser.urlencoded({ extended: false })

const redshiftClient = redshift.redshiftClient
const clusterName = redshift.clusterName

/* Routers for usecase  --start*/

/*GET, Edit-Usecase form */
router.get('/usecase/:usecase_id', (req, res )=> {

    /* fetching all cases from sqlite */
    let sql = `SELECT * FROM analytics_cases WHERE id = ?`
    sqliteDb.get(sql,[req.params.usecase_id],(err,row)=>{
        /* row.length==0 so that it doesn't catch error in  row[0].title*/
        if(err || (row!==undefined && row.length===0)) {
            console.log(chalk.yellow("Error-sqlite: "+ err))
            return res.render('templates/config_usecase/edit_usecase', {
                title: "Error",
                error: "Error querying Sqlite",
                clusterName: clusterName,
                usecase_id: req.params.usecase_id
            })
        }
        res.render('templates/config_usecase/edit_usecase', { title:"Edit Usecase", clusterName:clusterName,result:row,usecase_id:req.params.usecase_id })
    })
})

/*PUT, Edit-usecase form submisson */
router.put('/usecase/update', (req,res)=>{
    let sql = `UPDATE analytics_cases SET title=?, tablename=? WHERE id=?`
    sqliteDb.run(sql,[req.body.title, req.body.tablename, req.body.id],(err)=>{
        if(err) {
            console.log(chalk.yellow("Error-sqlite: "+ err))
            res.send({error: err})
        }
        else
            res.send({msg:"Updated Successfully!"})
    })
})
/* DELETE, Deleting Usecase;  */
router.delete('/usecase/delete/:usecase_id', (req,res)=>{
    sqliteDb.serialize(() => {
        // Queries scheduled here will be serialized.
        sqliteDb.run(`DELETE FROM analytics_cases WHERE id='${req.params.usecase_id}'`)
            .run(`DELETE FROM all_queries WHERE usecase_id='${req.params.usecase_id}'`)
            .run(`DELETE FROM all_plots WHERE usecase_id='${req.params.usecase_id}'`, (err, row) => {
                if(err) {
                    console.log(chalk.yellow("Error-sqlite: "+ err))
                    return res.send({error: err})
                }
                else
                    res.send({msg:"Deleted Successfully"})
            })
    })
})
/* Routers for usecase --end*/

/* Routers for queries  --start*/

/* GET, See all queries */
router.get('/all_queries/:usecase_id', (req, res )=> {

    /* fetching all cases from sqlite */
    let sql = `SELECT * FROM all_queries WHERE usecase_id = ?`
    sqliteDb.all(sql,[req.params.usecase_id],(err,row)=>{
        /* row.length==0 so that it doesn't catch error in  row[0].title*/
        if(err || (row!==undefined && row.length===0)) {
            console.log(chalk.yellow("Error-sqlite: "+ err))
            return res.render('templates/config_usecase/all_queries', {
                error: "Error querying Sqlite",
                clusterName: clusterName,
                usecase_id: req.params.usecase_id
            })
        }
        res.render('templates/config_usecase/all_queries', { title:"All Queries", clusterName:clusterName,result:row,usecase_id:req.params.usecase_id })
    })
})

/* GET, Form page for adding Query for usecase_id */
router.get('/query/add/:usecase_id', (req,res)=>{
    res.render('templates/config_usecase/add_query',{usecase_id:req.params.usecase_id, title:'Add'})
})

/* POST, Inserting Queries;  */
router.post('/query/add/:usecase_id', urlencodedParser, (req,res)=>{

    let sql = `INSERT INTO all_queries(usecase_id,type,title,query,description) VALUES(?,?,?,?,?)`
    sqliteDb.run(sql,[req.params.usecase_id, req.body.type, req.body.title, req.body.query, req.body.description],(err)=>{
        if(err) {
            console.log(chalk.yellow("Error-sqlite: "+ err))
            res.render('templates/config_usecase/add_query', {error: [err], usecase_id: req.params.usecase_id})
        }
        else
            res.render('templates/config_usecase/add_query', {message:["Added Successfully!"],usecase_id:req.params.usecase_id})
    })
})

/* PUT, Updating Queries;  */
router.put('/query/update', urlencodedParser, (req,res)=>{

    let sql = `UPDATE all_queries SET type=?, title=?, query=?, description=? WHERE id=?`
    sqliteDb.run(sql,[req.body.type, req.body.title, req.body.query, req.body.description, req.body.id ],(err)=>{
        if(err) {
            console.log(chalk.yellow("Error-sqlite: "+ err))
            res.send({error: err})
        }
        else
            res.send({msg:"Updated Successfully!"})
    })

})

/* DELETE, Deleting Queries;  */
router.delete('/query/delete/:id', (req,res)=>{

    let sql=`DELETE FROM all_queries WHERE id=?`
    sqliteDb.run(sql,[req.params.id],(err)=>{
        if(err) {
            console.log(chalk.yellow("Error-sqlite: "+ err))
            res.send({error: err})
        }
        else
            res.send({msg:"Deleted Successfully!"})
    })
})
/* Routers for queries  --end*/


/* Routers for PLOTS  --start*/
router.get('/all_plots/:usecase_id', (req,res)=>{
    /* fetching all cases from sqlite */
    let sql = `SELECT ac.tablename,ac.table_columns,ap.* FROM all_plots as ap inner join analytics_cases as ac WHERE ap.usecase_id=? AND ac.id=?`
    sqliteDb.all(sql,[req.params.usecase_id,req.params.usecase_id],(err,rows)=>{
        /* row.length==0 so that it doesn't catch error in  row[0].title*/

        if(err || (rows!==undefined && rows.length===0)) {
            console.log(chalk.yellow("Error-sqlite: "+ err))
            return res.render('templates/config_usecase/all_plots', {
                error: "Error querying Sqlite",
                clusterName: clusterName,
                usecase_id: req.params.usecase_id
            })
        }
        rows.forEach((item)=>{
            item.table_columns = item.table_columns.split(',')
        })
        res.render('templates/config_usecase/all_plots', { title:"All Plots", clusterName:clusterName,result:rows,usecase_id:req.params.usecase_id })
    })
})

/*GET, Form-page for adding plots */
router.get('/plot/add/:usecase_id', (req,res)=>{
    let message =[],error=[]
    if(req.query.msg!==undefined)
        message.push(req.query.msg)
    if(req.query.error!==undefined)
        message.push(req.query.err)
    /*Fetching tablename and columns */
    let sql=`SELECT * FROM analytics_cases WHERE id=?`
    sqliteDb.get(sql,[req.params.usecase_id],(err,row)=>{
        if(err) {
            console.log(chalk.yellow("Error-sqlite: "+ err))
            return res.render('templates/error')
        }
        else if( (row!==undefined && row.length===0))
            res.render('templates/config_usecase/add_plot',{title:'Add Plot',error:"No data found", usecase_id:req.params.usecase_id})
        else{
            row.table_columns = row.table_columns.split(',')
            res.render('templates/config_usecase/add_plot',{title:'Add Plot',table:row.tablename, result:row.table_columns, usecase_id:req.params.usecase_id, message:message ,error:error })
        }
    })
})
/* POST, generates sql for creating plots */
router.post('/plot/gen_sql', (req,res)=>{
    let sql
    if(req.body.date_time_format == 'epoch'){
        sql = `SELECT COUNT(distinct ${req.body.y_axis}) as ${req.body.y_axis}_count,date_trunc('day',timestamp 'epoch'+${req.body.x_axis}/1000*INTERVAL'1 second') AS days FROM marvin.${req.body.tablename} WHERE days>=current_date-$timePeriod AND days<current_date GROUP BY days order by days;`
    }
    else{
        sql = `SELECT COUNT(distinct ${req.body.y_axis}) as ${req.body.y_axis}_count,date_trunc('day',cast(${req.body.x_axis} AS timestamp)) AS days FROM marvin.${req.body.tablename} WHERE days>=current_date-$timePeriod AND days<current_date GROUP BY days order by days;`
    }
    res.send({sql:sql})
})
/* POST, Insert new plot */
router.post('/plot/add/:usecase_id',urlencodedParser, (req,res)=>{
    let sql = `INSERT INTO all_plots(usecase_id,x_axis,y_axis,date_time_format,title,query) VALUES(?, ?, ?, ?, ?, ?)`
    sqliteDb.run(sql,[req.params.usecase_id,req.body.x_axis,req.body.y_axis,req.body.date_time_format,req.body.title,req.body.gen_sql], (err)=>{
        if(err){
             console.log(chalk.yellow("Error-sqlite: "+ err))
             res.redirect('/config/plot/add' +req.params.usecase_id+'/?error=' + err)
        }
        else{
            let msg = encodeURIComponent("Added Successfully!")
            res.redirect('/config/plot/add/'+req.params.usecase_id+'/?msg=' + msg)
        }
    })
})
/* PUT, Updating Plot;  */
router.put('/plot/update', urlencodedParser, (req,res)=>{

    let sql = `UPDATE all_plots SET title=?, x_axis=?, y_axis=?, date_time_format=?, query=? WHERE id=?`
    sqliteDb.run(sql,[req.body.title, req.body.x_axis, req.body.y_axis, req.body.date_time_format,req.body.query,req.body.id ],(err)=>{
        if(err) {
            console.log(chalk.yellow("Error-sqlite: "+ err))
            res.send({error: err})
        }
        else
            res.send({msg:"Updated Successfully!"})
    })
})
/* DELETE, Deleting Plot;  */
router.delete('/plot/delete/:id', (req,res)=>{

    let sql=`DELETE FROM all_plots WHERE id=?`
    sqliteDb.run(sql,[req.params.id],(err)=>{
        if(err) {
            console.log(chalk.yellow("Error-sqlite: "+ err))
            res.send({error: err})
        }
        else
            res.send({msg:"Deleted Successfully!"})
    })
})

/* Routers for PLOT  --end*/

module.exports = router