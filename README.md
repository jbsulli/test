# 3 - Cookies

Express.js Node.js application with a config file, static file serving, POST/JSON request handling, and cookies.

Requirements:

1. Node.js https://nodejs.org/
2. NPM https://www.npmjs.com/
3. GitHub
3. A browser

Follow these instructions to launch:

1. Use GitHub to clone branch to a local folder
2. Launch terminal/cmd and `cd` to the local folder
3. Use NPM to install by running `npm install` in terminal/cmd
4. Run using Node.js `node app.js`
5. If all went well, open a browser and navigate to `http://localhost:8080`

Additional:
1. Navigate to `http://localhost:8080/cookies` to see all signed cookies
2. Navigate to `http://localhost:8080/cookies/set` to set cookieVal to 0 for 5 minutes. Repeat to increment the cookieVal.
3. Navigate to `http://localhost:8080/cookies/unset` to clear cookieVal.

Bonus:

1. Edit the config file to change the port to 1337
2. Run using Node.js `node app.js`
3. Navigate to `http://localhost:1337`
4. Send GET/POST/JSON to `http://localhost:8080/data` to see it work.
5. Toggle settings in the config file.
6. Get the cookies to last 30 minutes instead of 5.
7. Play with the cookie settings in the config file. Note: if you turn off signed cookies, get the cookie values from req.cookies instead of req.signedCookies.
