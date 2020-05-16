let Redshift = require('node-redshift')

let client = {
    user:'awsuser',
    database:'cpi',
    password:'Gokaruna123',
    port:5439,
    host:'redshift-cluster-1.c1t7hdxqfbsq.ap-south-1.redshift.amazonaws.com'
}
let redshiftClient = new Redshift(client)

module.exports = redshiftClient