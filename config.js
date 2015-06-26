module.exports = {
    cookies: true,
    cookie_secret: 'A secret string to hash cookies with.',
    cookie_settings: {
        signed: true,               // encrypt the cookie value?
        httpOnly: true,             // hide from JavaScript?
        maxAge: 5 * 60 * 1000       // how long should the cookie last (milliseconds)
    },
    json: true,                     // allow json body parsing
    port: 8080,                     // the port to listen on
    post: true,                     // allow POST body parsing
    static_folder: 'public'         // the static folder
};