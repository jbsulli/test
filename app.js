var Express = require('express');
var config = require('./config.js');
var PORT = config.port || 8080;

// create an Express app
var app = Express();

/*** SERVER SETUP ********************************************************************************/

// serve any static files from the static folder
if(config.static_folder) app.use(Express.static(config.static_folder));

// parse post/json requests? Limit requests to 50MB and allow extended POST requests (nested arrays/objects)
if (config.json) app.use(require('body-parser').json({ limit: '50mb' }));
if (config.post) app.use(require('body-parser').urlencoded({ extended: true, limit: '50mb' }));

/*** REQUEST HANDLERS ****************************************************************************/

// GET / (site root handler)
app.get('/', function (req, res, next) {
    res.send("<!DOCTYPE html><html><head><title>Hello World</title></head><body><img src=\"/img/smile.jpg\" /><br />Hello World!</body></html>");
});

// GET /data
app.all('/data', function (req, res, next) {
    // send back all data sent as a JSON object
    res.send({
        body: req.body,
        headers: req.headers,
        ip: req.ip,
        query: req.query
    });
});

/*** SERVER STARTUP ******************************************************************************/

// start up
app.listen(PORT, function (err) {
    if (err) return console.error(err);
    console.log('Server listening on port ' + PORT);
});

/*** HELPERS *************************************************************************************/
