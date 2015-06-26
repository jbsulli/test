var Express = require('express');
var config = require('./config.js');
var MongoDB = require('mongodb').MongoClient;

var PORT = config.port || 8080;
var COOKIE_SETTINGS = config.cookie_settings || { signed: true, httpOnly: true, maxAge: 5 * 60 * 1000 };

// create an Express app
var app = Express();

// MongoDB vars
var MongoDatabase;
var TestCollection;

/*** SERVER SETUP ********************************************************************************/

// serve any static files from the static folder
if(config.static_folder) app.use(Express.static(config.static_folder));

// parse post/json requests? Limit requests to 50MB and allow extended POST requests (nested arrays/objects)
if (config.json) app.use(require('body-parser').json({ limit: '50mb' }));
if (config.post) app.use(require('body-parser').urlencoded({ extended: true, limit: '50mb' }));

// enable cookies?
if (config.cookies) app.use(require('cookie-parser')(config.cookie_secret || 'some very secret string'));

/*** MONGODB CONNECTION **************************************************************************/

// if we're connecting to MongoDB...
if (config.mongo) {
    MongoDB.connect(mongoURL(config.mongo), { uri_decode_auth: true, server: { auto_reconnect: true, socketOptions: { keepAlive: 300 } }, replSet: { rs_name: 'rs1', auto_reconnect: true, socketOptions: { keepAlive: 300 } } }, function (err, database) {
        if (err) throw err;
        console.log('Connected to MongoDB');
        MongoDatabase = database;
        TestCollection = MongoDatabase.collection('test');
    });
}

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

// if we have MongoDB settings
if (config.mongo) {
    // GET /mongo for seeing all db.test records in mongo
    app.get('/mongo', function (req, res, next) {
        // make sure we're connected to MongoDB
        if (!TestCollection) return next(new Error('Not connected to MongoDB yet.'));
        
        // get all the records in the MongoDB test collection
        TestCollection.find({}).sort({ _id: 1 }).toArray(function (err, messages) {
            // if there was an error, pass it on to the express handler
            if (err) return next(err);
            
            // compile all the messages
            var message_text = '';
            messages.forEach(function (message) {
                // add a break tag between messages
                if (message_text !== '') message_text += '<br />';
                // add the message text. 
                // NOTE: this should be escaped. A user could type in HTML and it would show up. But this is just a simple example.
                message_text += message.message;
            });
            
            // send the messages and a simple form for adding more
            res.send('<p>' + message_text + '</p><form method="POST">Message:<input type="text" name="message" /><input type="submit" value="submit" /></form>');
        });
    });
    
    // POST /mongo for submitting a new message to the MongoDB test collection
    app.post('/mongo', function (req, res, next) {
        // get the message
        var message = req.body.message;
        // make sure a message was sent to be saved
        if (!message || message.length == 0) return res.send('No message to save.<br /><a href="/mongo">Try again.</a>');
        
        // get the last index
        TestCollection.insert({ _id: new Date(), message: message }, function (err, result) {
            if (err) return next(err);
            // print the message back to the user. 
            // NOTE: this should be escaped. A user could type in HTML and it would show up. But this is just a simple example.
            res.send('Inserted: ' + message + '<br><a href="/mongo">Add another</a>');
        });
    });
}

/*** SERVER STARTUP ******************************************************************************/

// start up
app.listen(PORT, function (err) {
    if (err) return console.error(err);
    console.log('Server listening on port ' + PORT);
});

/*** HELPERS *************************************************************************************/

// MongoDB URL helper function
// Builds the connection string based on a config object (just makes it much easier to handle with our config file)
function mongoURL(auth) {
    // check database
    if (!auth.database) throw new Error('MongoDB connection requires a database name.');
    
    // build the connection url
    var url = '', a = false;
    for (var i = 0; i === 0 || a; i++) {
        var d = { host: auth.host, port: auth.port };
        for (var f in d) {
            if (d[f] && Array.isArray(d[f])) {
                a = true;
                if (i >= d[f].length) {
                    i = -1;
                    break;
                } else {
                    d[f] = d[f][i];
                }
            }
        }
        if (i == -1) break;
        if (url !== '') url += ',';
        url += (d.host || 'localhost') + (d.port ? ':' + d.port : '');
    }
    
    // build the URL and return
    return 'mongodb://' + (auth.user ? auth.user + ':' + encodeURIComponent(auth.password) + '@' : '') + url + '/' + auth.database;
}