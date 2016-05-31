var lint_endpoints = require('./lightning-linter-endpoint');
var org_endpoints = require('./org-endpoints');
/*Express*/
//express for routing
var port = process.env.PORT || 8675;
var express = require('express');
var app = express();
var bodyParser = require("body-parser");
var path = require('path')
var dust = require('express-dustjs')
var session = require('express-session')

app.use(bodyParser.text({ type: 'text/plain', limit: '50mb' }));

var sessionOptions = {
  secret: "mxyplyx",
  resave : true,
  saveUninitialized : false
};

app.use(session(sessionOptions));


app.engine('dust', dust.engine({
  // Use dustjs-helpers 
  useHelpers: true
}))
app.set('view engine', 'dust');
app.set('views', path.resolve(__dirname, './static/views'));
app.use(express.static('./static'));

lint_endpoints.addRoutes(app,true);
org_endpoints.addOAuthRoutes(app);


app.get('/', function (req, res) {
  console.log(req.session.accessToken == null);
  res.render('pg_index', {
    name : "World",
    login : req.session.accessToken == null
  })
})

app.get('/success', function (req, res) {
  res.render('pg_index', {
    name : "Success",
    login : req.session.accessToken == null
  })
})

app.get('/error', function (req, res) {
  res.render('pg_index', {
    name : "Error",
    login : req.session.accessToken == null
  })
})

app.get('/lint_code', function (req, res) {
  res.render('pg_lint_code', {
    login : req.session.accessToken == null
  });
})


app.get('/lint_org', function (req, res) {
  org_endpoints.getLightningComponentJS(req,res,lint_endpoints.createOrgReport);
})



//setup actual server
var server = app.listen(port, function () {

  console.log('Lightning Linter running on '+port);
  require('dns').lookup(require('os').hostname(), function (err, add, fam) {
    console.log('addr: '+add);
  });

});