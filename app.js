var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var sns = require('express-aws-sns');
const snsSubscriptionConfirmation = require('aws-sns-subscription-confirmation');
var Sequalize = require('sequelize');
var fs = require('fs')
  , Log = require('log')
  , log = new Log('debug', fs.createWriteStream(__dirname + '/emails.log'));
  
var sequalize = new Sequalize(
    'xxx',
    'xxx',
    'xxx', {
        host: 'xxx',
        dialect: 'postgres',
        port: '5432',
        define: {
            underscored: true
        },
        pool: {
            max: 10
        }
    }
);

const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/emailsLog');

const emails = mongoose.model('emails', { email: String });

var index = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.text());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// app.use(snsSubscriptionConfirmation.overrideContentType());
// app.use(bodyParser.json());
// app.use(snsSubscriptionConfirmation.snsConfirmHandler());

app.post('*', (req, res, next) => {
  var data = JSON.parse(JSON.parse(req.body).Message);
  console.log(data.mail.destination[0]);
    // console.log(req.headers);
    // console.log(data);
//   if (data.notificationType === 'Bounce') {
//     console.log(data.mail.destination[0]);
//     unsubscribe(data.mail.destination[0]);
//   }
  res.json();
});


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

function unsubscribe(email) {
  log.info(email);    
    sequalize.query("SELECT job_seekers.id FROM job_seekers LEFT JOIN users ON job_seekers.user_id = users.id WHERE users.username = '" + email + "' LIMIT 1").then((user) => {
          sequalize.query('UPDATE job_alerts SET disabled=true WHERE job_seeker_id = ' + user[0][0].id).then((data) => {
              console.log('success', data);
          }).catch(() => {
              console.log('error');
          });
    });
}


module.exports = app;
