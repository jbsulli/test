var Express = require('express');
var Util = require('util');

var app = Express();

app.get('/', function (req, res, next) {
    res.send(req.ip);
});

app.listen(80, function (err) { console.log(err || 'Server listening'); });