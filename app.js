let logger = require('morgan')
let indexRouter = require('./routes/index')
let analyticsRouter = require('./routes/analytics')
let configRouter = require('./routes/configure')
let AWS = require('aws-sdk')
let express = require('express')
let createError = require('http-errors')

AWS.config.region = process.env.REGION

let app = express()
//template engine
let hbs = require('hbs')
hbs.registerPartials(__dirname + '/views/partials')
hbs.registerHelper('ifCond', function (v1, operator, v2, options) {
  switch (operator) {
    case '==':
      return (v1 == v2) ? options.fn(this) : options.inverse(this);
    case '===':
      return (v1 === v2) ? options.fn(this) : options.inverse(this);
    case '!==':
      return (v1 !== v2) ? options.fn(this) : options.inverse(this);
    case '<':
      return (v1 < v2) ? options.fn(this) : options.inverse(this);
    case '<=':
      return (v1 <= v2) ? options.fn(this) : options.inverse(this);
    case '>':
      return (v1 > v2) ? options.fn(this) : options.inverse(this);
    case '>=':
      return (v1 >= v2) ? options.fn(this) : options.inverse(this);
    case '&&':
      return (v1 && v2) ? options.fn(this) : options.inverse(this);
    case '||':
      return (v1 || v2) ? options.fn(this) : options.inverse(this);
    default:
      return options.inverse(this);
  }
});

// view engine setup
app.set('view engine', 'hbs')
app.set('views',__dirname + '/views')

app.use(logger('dev'))
app.use(express.json())




app.use('/static', express.static(__dirname + '/node_modules/'));
app.use('/public', express.static(__dirname + '/public/'));

//Route files
app.use('/', indexRouter)
app.use('/analytics', analyticsRouter)
app.use('/config', configRouter)

// catch 404 and forward to error handler
app.use(function(req, res) {
  res.render('templates/error')
})


let port = process.env.PORT || 8000

let server = app.listen(port, function () {
  console.log('Server running at http://127.0.0.1:' + port + '/')
})

module.exports = app
