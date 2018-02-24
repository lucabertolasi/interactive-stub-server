const fs     = require('fs');
const path   = require('path');

const compression = require('compression');
const helmet      = require('helmet');
const app         = require('express')();
app.use(compression());
app.use(helmet());

const server      = require('http').Server(app);
const io          = require('socket.io')(server);


const ROUTES = [];

const PORT = 6969;
server.listen(PORT, () => {
  console.log(`go to http://localhost:${PORT}`);
});


io.on('connection', socket => {

  socket.on('route', route => {
    try {

      if (route.regexp !== undefined
      &&  route.regexp !== null
      &&  typeof route.regexp === 'string'
      &&  route.regexp.length > 0

      &&  route.json !== undefined
      &&  route.json !== null
      &&  typeof route.json === 'string'
      &&  route.json.length > 0) {

        new RegExp(`^${route.regexp}$`, 'g');
        JSON.parse(route.json);

        const _route = ROUTES.find(_route => _route.regexp === route.regexp);
        if (_route) {
          _route.json = route.json;
        } else {
          ROUTES.push(route);
        }
      }

    } catch (e) {
      // console.log(e);
      // do nothing
      // res.status(404).json({ error: 'message' });
      // res.setHeader('Content-Type', 'application/json');
      // res.send(JSON.stringify({ a: 1 }));
    }
  });

  socket.on('feedback', feedback => {
    console.log(feedback);
  });

});


app.get('*', (req, res) => {
    console.log('\n');
    console.log('remoteAddress', req.connection.remoteAddress);
    console.log('originalUrl', req.originalUrl);

    if (req.originalUrl === '/main.1736c88c3d08c328a873f1006c0f995b.css?e7bc8a679c438d25230c') {
      res.sendFile(`${__dirname}/dist/main.1736c88c3d08c328a873f1006c0f995b.css`);
      console.log(200);

    } else if (req.originalUrl === '/app.js?e7bc8a679c438d25230c') {
      res.sendFile(`${__dirname}/dist/app.js`);
      console.log(200);

    } else if (req.originalUrl === '/') {
      res.status(200).json({
          who: "you",
          what: "write/paste/edit & serve your JSONs on custom routes in real-time",
          why: "save time while testing or prototyping",
          where: `go to http://localhost:6969/_`,
          when: Date.now() % 2 ? 'time is always right to do what is right - Martin Luther King, Jr.' : 'you may delay, but time will not - Benjamin Franklin'
      })
      console.log(200);

    } else if (req.originalUrl === '/_') {
        // SHOW EDITOR
        res.sendFile(`${__dirname}/dist/index.html`);
        console.log(200);

    } else {
      let found = false;
      routesLoop:
      for (let i = 0; i < ROUTES.length; i += 1) {
        const route  = ROUTES[i];
        const regexp = new RegExp(`^${route.regexp}$`, 'g');
        if (req.originalUrl.substr(1).match(regexp)) {
          res.setHeader('Content-Type', 'application/json');
          res.status(200).send(route.json);
          console.log(200);
          found = true;
          break routesLoop;
        }
      }
      if (!found) {
        const err = { error: 'route not defined' };
        res.status(404).json(err);
        console.log(404);
      };
    }

    console.log('\n');
})
