const express = require('express')
const router = express.Router()
const nodeCache = require('node-cache')
const myCache = new nodeCache()

router.get('/',(req,res)=>{

    obj = { my: "Special", variable: 42 };
    let value = myCache.get( "myKey" )
    if(value===undefined){
        myCache.set( "myKey", obj, 100 );
        setTimeout(()=>{
            res.send(obj)
        },2000)
    }
    else
    {
        res.send(value)
    }
})

module.exports = router