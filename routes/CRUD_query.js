const express = require('express')
const router = express.Router()
const redshift = require('../src/utils/redshift_connect')
const sqliteDb = require('../src/utils/sqlite_connect')

/* Middleware for getting POST body data */
const bodyParser = require('body-parser')
const urlencodedParser = bodyParser.urlencoded({ extended: false })

const redshiftClient = redshift.redshiftClient
const clusterName = redshift.clusterName

/* Form page for adding Query for usecase_id:id */
router.get('/:usecase_id', (req,res)=>{
res.render('templates/add_query',{usecase_id:req.params.usecase_id, title:'Add'})
})


/* POST, Inserting Queries;  */
router.post('/:usecase_id/insert', urlencodedParser, (req,res)=>{

    console.log(req.body)
    let sql = `INSERT INTO all_queries(usecase_id,type,title,query) VALUES("${req.params.usecase_id}","${req.body.type}","${req.body.title}","${req.body.query}")`
    sqliteDb.run(sql,[],(err)=>{
        console.log(err)
        if(err)
            res.render('templates/add_query', {error:err})
        else
            res.render('templates/add_query', {msg:"Added Successfully!",usecase_id:req.params.usecase_id})
    })
})

/* POST, Updating Queries;  */
router.put('/:usecase_id/update', urlencodedParser, (req,res)=>{

    let sql = `UPDATE all_queries SET type="${req.body.type}", title="${req.body.title}", query="${req.body.query}" WHERE id=${req.body.id}`
    console.log(sql)
    sqliteDb.run(sql,[],(err)=>{
        console.log(err)
        if(err)
            res.send({error:err})
        else
            res.send({msg:"Updated Successfully!"})
    })

})

router.delete('/delete/:id', (req,res)=>{

    let sql=`DELETE FROM all_queries WHERE id=${req.params.id}`
    sqliteDb.run(sql,[],(err)=>{
        console.log(err)
        if(err)
            res.send({error:err})
        else
            res.send({msg:"Deleted Successfully!"})
    })
})

module.exports = router