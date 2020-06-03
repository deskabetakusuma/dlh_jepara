var connection = require('../database').connection;
var express = require('express');
var router = express.Router();
var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy
  , static = require('serve-static')
  , bodyParser = require('body-parser')
  , cookieParser = require('cookie-parser')
  , path = require('path')
  ,  sha1 = require('sha1');
  var sql_enak = require('../database/mysql_enak.js').connection;
  var cek_login = require('./login').cek_login;
  var cek_login_google = require('./login').cek_login_google;
  var dbgeo = require("dbgeo");
  var multer = require("multer");
  var st = require('knex-postgis')(sql_enak);
  var deasync = require('deasync');
  path.join(__dirname, '/public/foto')
  router.use(bodyParser.json());
  router.use(bodyParser.urlencoded({ extended: true }));

  router.use(cookieParser() );
  router.use(passport.initialize());
  router.use(passport.session());
  router.use(function (req, res, next) {

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
// middleware that is specific to this router
router.use(function timeLog(req, res, next) {
  console.log('Time: ', Date.now());
  next();
});

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/foto/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now()+'-'+file.originalname)
  }
})

var upload = multer({ storage: storage })

//start-------------------------------------
router.get('/jenis', cek_login, function(req, res) {
  connection.query("SELECT * from master_jenis where deleted=0", function(err, rows, fields) {
  res.render('content-backoffice/manajemen_master_jenis/list',{data:rows}); 
})
});

router.get('/jenis/insert', cek_login, function(req, res) {
  res.render('content-backoffice/manajemen_master_jenis/insert'); 
});

router.get('/jenis/edit/:id', cek_login, function(req, res) {
  res.render('content-backoffice/manajemen_master_jenis/edit'); 
});

router.post('/submit_insert', cek_login, function(req, res){
  var idne ="";
  var post = {}
 post = req.body;
 
var satuan=req.body.satuan;
var batas_min=req.body.batas_min;
var simbolmin=req.body.simbolmin;
var simbolmax=req.body.simbolmax;
var batas_max=req.body.batas_max;
console.log(satuan);
delete post['satuan'];
delete post['batas_min'];
delete post['simbolmin'];
delete post['simbolmax'];
delete post['batas_max'];
 console.log(post)
   sql_enak.insert(post).into("master_jenis").then(function (id) {
  console.log(id);
  idne=id;
})
.finally(function() {
  
    
    for(var i=0; i<satuan.length; i++){
   
      console.log(satuan[i]);
      connection.query("INSERT INTO rumus (satuan, id_jenis, batas_min, batas_max, simbolmin, simbolmax) VALUES ('"+satuan[i]+"', '"+idne+"','"+batas_min[i]+"','"+batas_max[i]+"','"+simbolmin[i]+"', '"+simbolmax[i]+"');", function(err, aa, fields) {
        
    })
      
      
    }
  
    res.redirect('/manajemen_master/jenis'); 
  
});
});

router.get('/delete/:id', cek_login, function(req, res) {
  
  // senjata
  // console.log(req.params.id)
  connection.query("update master_jenis SET deleted=1 WHERE id='"+req.params.id+"' ", function(err, rows, fields) {
  //  if (err) throw err;
    numRows = rows.affectedRows;
  })

  res.redirect('/manajemen_master/jenis');
});

module.exports = router;
