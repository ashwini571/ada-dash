let Redshift = require('node-redshift')
let CONFIG = require('./redshift_config')
let redshiftClient

let client = {
    user:CONFIG.user,
    database:CONFIG.database,
    password:CONFIG.password,
    port:CONFIG.port,
    host:CONFIG.host
}
let clusterName = CONFIG.host.split('.')[0]
try{
    redshiftClient = new Redshift(client)
}
catch(e)
{
    console.log("Something went wrong " + e)
}

module.exports={
    redshiftClient:redshiftClient,
    clusterName:clusterName
}