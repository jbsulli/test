var Express = require('express');
var PORT = 8080;

// create an Express app
var app = Express();

/*** SERVER SETUP ********************************************************************************/


/*** REQUEST HANDLERS ****************************************************************************/

// GET / (site root handler)
app.get('/', function (req, res, next) {
    res.send("Hello World!");
});

/*** SERVER STARTUP ******************************************************************************/

// start up
app.listen(PORT, function (err) {
    if (err) return console.error(err);
    console.log('Server listening on port ' + PORT);
});

/*** HELPERS *************************************************************************************/
