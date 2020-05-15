let express = require('express')
let router = express.Router()
let redshiftClient = require('../src/utils/redshift')

/* GET home page. */
router.get('/', function(req, res, next) {

  let queryStr = "select store_id, timestamp 'epoch'+timestamp/1000*INTERVAL'1 second' as download_time " +
      "from public.async_reports_status where report='Content Performance' order by timestamp desc"

  // execute query and invoke callback...
  redshiftClient.query(queryStr,(err,result)=>{
    if(err)
      res.render('templates/error',{error:err})
    else
        res.render('templates/index', { title: 'Express',result:result})
  })

})
module.exports = router
