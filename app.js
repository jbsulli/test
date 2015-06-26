var Express = require('express');
var config = require('./config.js');

var PORT = config.port || 8080;
var COOKIE_SETTINGS = config.cookie_settings || { signed: true, httpOnly: true, maxAge: 5 * 60 * 1000 };

// create an Express app
var app = Express();


/*** SERVER SETUP ********************************************************************************/

// serve any static files from the static folder
if(config.static_folder) app.use(Express.static(config.static_folder));

// parse post/json requests? Limit requests to 50MB and allow extended POST requests (nested arrays/objects)
if (config.json) app.use(require('body-parser').json({ limit: '50mb' }));
if (config.post) app.use(require('body-parser').urlencoded({ extended: true, limit: '50mb' }));

// enable cookies?
if (config.cookies) app.use(require('cookie-parser')(config.cookie_secret || 'some very secret string'));

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
        cookies: req.cookies,
        headers: req.headers,
        ip: req.ip,
        query: req.query,
        signedCookies: req.signedCookies
    });
});

// only add these HTTP handlers if signed cookies are set
if (config.cookies && COOKIE_SETTINGS.signed) {

    // GET /cookies to see all signed cookies
    app.get('/cookies', function (req, res, next) { res.send(req.signedCookies); });
    
    // GET /cookies/set to set cookieVal in the cookie
    app.get('/cookies/set', function (req, res, next) {
        // if the cookieVal hasn't been set
        if (req.signedCookies.cookieVal === undefined) {
            // initialize to zero
            req.signedCookies.cookieVal = 0;
            // respond with the updated cookie
            res.cookie('cookieVal', req.signedCookies.cookieVal, COOKIE_SETTINGS);
        } else {
            // add one to the cookieVal
            req.signedCookies.cookieVal = parseInt(req.signedCookies.cookieVal) + 1;
            // respond with the updated cookie
            res.cookie('cookieVal', req.signedCookies.cookieVal, COOKIE_SETTINGS);
        }
        // give an update
        res.send("cookieVal set to " + req.signedCookies.cookieVal);
    });
    
    // GET /cookies/unset to unset all cookies
    app.get('/cookies/unset', function (req, res, next) {
        // unset the cookieVal
        res.clearCookie('cookieVal');
        // and respond with the status
        res.send('cookieVal unset.');
    });
}

/*** SERVER STARTUP ******************************************************************************/

// start up
app.listen(PORT, function (err) {
    if (err) return console.error(err);
    console.log('Server listening on port ' + PORT);
});

/*** HELPERS *************************************************************************************/
