var express = require('express')
  , http = require('http')
  , path = require('path')
  , logger = require('morgan')
  , bodyParser = require('body-parser')
  , methodOverride = require('method-override')
  , static = require('serve-static')
  , errorHandler =require('errorhandler')
  , passport = require('passport')
  , session = require('express-session')
  , cookieParser = require('cookie-parser')
  , flash=require("connect-flash")
  , LocalStrategy = require('passport-local').Strategy;

var login = require('./isine/login').router;
var peta = require('./isine/topojson');
var upload = require('./isine/upload_file');
var upload_shp = require('./isine/upload_shp');
var user = require('./isine/user');
var fn = require('./isine/ckeditor-upload-image');
var cek_login = require('./isine/login').cek_login;
var basic = require('./isine/basic');
var manajemen_master = require('./isine/manajemen_master');


var app = express();
var connection = require('./database').connection;
//var mysql2geojson = require("mysql2geojson");
var router = express.Router();
var dbgeo = require("dbgeo");
app.set('views', __dirname + '/views');
//app.set('view engine', 'jade');
//app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');


//end dbf dan shp
// all environments
app.set('port', process.env.PORT || 8855);

//app.use(express.favicon());
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});
app.use(logger('dev'));
app.use(methodOverride());
app.use(static(path.join(__dirname, 'public')));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser() );
app.use(session({duration: 50 * 60 * 1000,
                      activeDuration: 10 * 60 * 1000,
                       secret: 'bhagasitukeren', 
                       cookie: { maxAge : 60 * 60 * 1000 },
                       cookieName: 'session',
                       saveUninitialized: true,
                        resave: true }));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());  
// Add headers

// development only
if ('development' == app.get('env')) {
  app.use(errorHandler());
}
 var server = http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));  
});
var io = require('socket.io').listen(server, { log: false });

//mulai apps ----------------------------------------------------------
app.use('/autentifikasi', login);
app.use('/peta', peta);
app.use('/upload', upload);
app.use('/upload_shp', upload_shp);
app.use('/user', user);
app.use('/uploadckeditor', fn);

app.use('/basic', basic);
app.use('/manajemen_master', manajemen_master);

function compare(post, operator, value) {
  switch (operator) {
    case '>':   return post > value;
    case '<':   return post < value;
    case '>=':  return post >= value;
    case '<=':  return post <= value;
    case '==':  return post == value;
    case '!=':  return post != value;
    case '===': return post === value;
    case '!==': return post !== value;
  }
}

app.get('/', function (req, res) {
  console.log(req.user)
  res.render('content/index', {
        user: req.user
    });
});


app.get('/backoffice', cek_login, function (req, res) {
  console.log(req.user)
  res.render('content-backoffice/index');
});

app.get('/get_jenis/:bidang', function (req, res) {
  connection.query("SELECT * from master_jenis where deleted=0 and bidang='"+req.params.bidang+"'", function(err, rows, fields) {
  res.json(rows);
})
});

app.get('/get_rumus/:id', function (req, res) {
  connection.query("SELECT * from rumus where id_jenis="+req.params.id, function(err, rows, fields) {
  res.json(rows);
})
});

app.get('/get_hasil/:id/:ukuran', function (req, res) {
  var status="";
  connection.query("SELECT * from rumus where id_jenis="+req.params.id, function(err, rows, fields) {
    if(rows[0].simbolmin!=""){
     var tes=compare(parseFloat(rows[0].batas_min), rows[0].simbolmin, parseFloat(req.params.ukuran))

     if(tes){
        status="ukl upl";
      }else{
        status="sppl";
      }
      
    }
    if(rows[0].simbolmax!=""){
      var tes=compare(parseFloat(req.params.ukuran), rows[0].simbolmax, parseFloat(rows[0].batas_max))
      if(tes){
        if(status!="sppl"){
          status="ukl upl";
        }
      }else{
        status="AMDAL"
      }
    }
    res.json(status);
    console.log(status);
  })
})
// app.get('/4E26CD6CB47148CCFB9334CB15B95495.txt', function (req, res) {
//   console.log(req.user)
//   //res.render('7ECA9DC7A2167A6EB33B60F1DA8B85E1.txt');
//   var file = __dirname + '/4E26CD6CB47148CCFB9334CB15B95495.txt';
//     res.download(file);
// });
// app.listen(800, function () {
//   console.log('Example app listening on port 800!');
//admin
//mysql

app.use(function (req, res, next) {
  res.status(404).send("Halaman yang anda tuju tidak ada!")
})
  
<!-- start socketio connection -->

io.sockets.on('connection', function (socket) {	



});