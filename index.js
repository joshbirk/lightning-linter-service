var lint_endpoints = require('./lightning-linter-endpoint');

/*Express*/
//express for routing
var port = process.env.PORT || 8675;
var express = require('express');
var app = express();
var bodyParser = require("body-parser");
var path = require('path')
 var dust = require('express-dustjs')

app.use(bodyParser.text({ type: 'text/plain' }));
app.engine('dust', dust.engine({
  // Use dustjs-helpers 
  useHelpers: true
}))
app.set('view engine', 'dust');
app.set('views', path.resolve(__dirname, './static/views'));
app.use(express.static('./static'));

console.log(lint_endpoints);
lint_endpoints.addRoutes(app,true);

app.get('/', function (req, res) {
  // Render template with locals 
  res.render('index', {
    name : "World"
  })
})

app.get('/source', function (req, res) {
  // Render template with locals 
  res.render('source');
})


//setup actual server
var server = app.listen(port, function () {

  console.log('Lightning Linter running on '+port);
  require('dns').lookup(require('os').hostname(), function (err, add, fam) {
    console.log('addr: '+add);
  });

});