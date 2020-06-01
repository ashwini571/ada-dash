const express = require('express')
const router = express.Router()
const redshift = require('../src/utils/redshift_connect')
const sqliteDb = require('../src/utils/sqlite_connect')

/* Middleware for getting POST body data */
const bodyParser = require('body-parser')
const urlencodedParser = bodyParser.urlencoded({ extended: false })

const redshiftClient = redshift.redshiftClient
const clusterName = redshift.clusterName

/* Routers for usecase  --start*/

/*GET, Edit-Usecase form */
router.get('/usecase/:usecase_id', (req, res )=> {

    /* fetching all cases from sqlite */
    let sql = `SELECT * FROM analytics_cases WHERE id = '${req.params.usecase_id}' `
    sqliteDb.get(sql,[],(err,row)=>{
        /* row.length==0 so that it doesn't catch error in  row[0].title*/
        console.log(row)
        if(err || row.length==0)
            return res.render('templates/config_usecase/edit_usecase',{title:"Error",error:"Error querying Sqlite",clusterName:clusterName,usecase_id:req.params.usecase_id})

        res.render('templates/config_usecase/edit_usecase', { title:"Edit Usecase", clusterName:clusterName,result:row,usecase_id:req.params.usecase_id })
    })
})

/*PUT, Edit-usecase form submisson */
router.put('/usecase/update', (req,res)=>{
    let sql = `UPDATE analytics_cases SET title="${req.body.title}", tablename="${req.body.tablename}" WHERE id='${req.body.id}'`
    console.log(sql)
    sqliteDb.run(sql,[],(err)=>{
        console.log(err)
        if(err)
            res.send({error:err})
        else
            res.send({msg:"Updated Successfully!"})
    })
})
/* Routers for usecase --end*/

/* Routers for queries  --start*/

/*GET, See all queries */
router.get('/all_queries/:usecase_id', (req, res )=> {

    /* fetching all cases from sqlite */
    let sql = `SELECT * FROM all_queries WHERE usecase_id = '${req.params.usecase_id}' `
    sqliteDb.all(sql,[],(err,row)=>{
        /* row.length==0 so that it doesn't catch error in  row[0].title*/
        if(err || row.length==0)
            return res.render('templates/config_usecase/all_queries',{error:"Error querying Sqlite",clusterName:clusterName,usecase_id:req.params.usecase_id})

        res.render('templates/config_usecase/all_queries', { title:"All Queries", clusterName:clusterName,result:row,usecase_id:req.params.usecase_id })
    })
})

/* GET, Form page for adding Query for usecase_id */
router.get('/query/add/:usecase_id', (req,res)=>{
res.render('templates/config_usecase/add_query',{usecase_id:req.params.usecase_id, title:'Add'})
})


/* POST, Inserting Queries;  */
router.post('/query/add/:usecase_id', urlencodedParser, (req,res)=>{

    console.log(req.body)
    let sql = `INSERT INTO all_queries(usecase_id,type,title,query,description) VALUES("${req.params.usecase_id}","${req.body.type}","${req.body.title}","${req.body.query}","${req.body.description}")`
    sqliteDb.run(sql,[],(err)=>{
        console.log(err)
        if(err)
            res.render('templates/config_usecase/add_query', {error:err,usecase_id:req.params.usecase_id})
        else
            res.render('templates/config_usecase/add_query', {msg:"Added Successfully!",usecase_id:req.params.usecase_id})
    })
})

/* PUT, Updating Queries;  */
router.put('/query/update', urlencodedParser, (req,res)=>{

    let sql = `UPDATE all_queries SET type="${req.body.type}", title="${req.body.title}", query="${req.body.query}", description="${req.body.description}" WHERE id=${req.body.id}`
    console.log(sql)
    sqliteDb.run(sql,[],(err)=>{
        console.log(err)
        if(err)
            res.send({error:err})
        else
            res.send({msg:"Updated Successfully!"})
    })

})

/* DELETE, Deleting Queries;  */
router.delete('/query/delete/:id', (req,res)=>{

    let sql=`DELETE FROM all_queries WHERE id=${req.params.id}`
    sqliteDb.run(sql,[],(err)=>{
        console.log(err)
        if(err)
            res.send({error:err})
        else
            res.send({msg:"Deleted Successfully!"})
    })
})
/* Routers for queries  --end*/


/* Routers for PLOTS  --start*/
router.get('/all_plots/:usecase_id', (req,res)=>{
    
})

/*GET, Form-page for adding plots */
router.get('/plot/add/:usecase_id', (req,res)=>{
    let message =[],error=[]
    if(req.query.msg!==undefined)
        message.push(req.query.msg)
    if(req.query.error!==undefined)
        message.push(req.query.err)

    /*Fetching tablename */
    let sql=`SELECT tablename FROM analytics_cases WHERE id='${req.params.usecase_id}'`
    sqliteDb.get(sql,[],(err,row)=>{
        if(err)
            return res.render('templates/error')
        let query = `SELECT column_name FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '${row.tablename}'`
        redshiftClient.query(query, (error,result)=>{
            if(error)
                res.render('templates/config_usecase/add_plot',{title:'Add Plot',error:"Something went wrong", usecase_id:req.params.usecase_id})
            else if(result.rows.length==0)
                res.render('templates/config_usecase/add_plot',{title:'Add Plot',error:"No data found", usecase_id:req.params.usecase_id})
            else
                res.render('templates/config_usecase/add_plot',{title:'Add Plot',table:row.tablename, result:result.rows, usecase_id:req.params.usecase_id, message:message ,error:error })
        })
    })
})
/* POST, generates sql for creating plots */
router.post('/plot/gen_sql', (req,res)=>{
    let sql
    console.log(req.body)
    if(req.body.date_time_format == 'epoch'){
        sql = `SELECT COUNT(distinct ${req.body.y_axis}) as ${req.body.y_axis}_count,date_trunc('day',timestamp 'epoch'+${req.body.x_axis}/1000*INTERVAL'1 second') AS time FROM marvin.${req.body.tablename} WHERE time>getdate()-$timePeriod GROUP BY time order by time;`
    }
    else{
        sql = `SELECT COUNT(distinct ${req.body.y_axis}) as ${req.body.y_axis}_count,date_trunc('day',cast(${req.body.x_axis} AS timestamp)) AS time FROM marvin.${req.body.tablename} WHERE time>getdate()-$timePeriod GROUP BY time order by time;`
    }

    res.send({sql:sql})
})
/* POST, Insert new plot */
router.post('/plot/add/:usecase_id',urlencodedParser, (req,res)=>{
    console.log(req.body)
    let sql = `INSERT INTO all_plots(usecase_id,x_axis,y_axis,date_time_format,title,query) VALUES("${req.params.usecase_id}", "${req.body.x_axis}", "${req.body.y_axis}", "${req.body.date_time_format}", "${req.body.title}", "${req.body.gen_sql}")`
    sqliteDb.run(sql,[], (err)=>{
        if(err){
         let error = err
         res.redirect('/config/plot/add' +req.params.usecase_id+'/?error=' + error)
        }
        else{
            let msg = encodeURIComponent("Added Successfully!")
            res.redirect('/config/plot/add/'+req.params.usecase_id+'/?msg=' + msg)
        }
    })
})

/* Routers for PLOT  --end*/

module.exports = router