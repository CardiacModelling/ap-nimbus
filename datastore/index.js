const express = require('express')
const bodyParser = require('body-parser')
const MongoClient = require('mongodb').MongoClient

const dbName = process.env.WAIT_HOSTS
const url = `mongodb://${process.env.MONGO_INITDB_ROOT_USERNAME}:${process.env.MONGO_INITDB_ROOT_PASSWORD}@${dbName}?authMechanism=SCRAM-SHA-1&authSource=admin`

const options = {
  useNewUrlParser: true,
  reconnectTries: 60,
  reconnectInterval: 1000
}
const routes = require('./routes/routes.js')
const port = process.env.PORT || 80
const app = express()
const http = require('http').Server(app)

// Specify 'limit' below, otherwise "PayloadTooLargeError: request entity too large"
app.use(bodyParser.json( { limit: '1mb', extended: true }))
app.use(bodyParser.urlencoded({ limit: '1mb', extended: true }))
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Cache-control, Pragma, Expires");
  next();
});
app.use('/api', routes)
app.use('*', (request, response, next) => {
  console.log('WARN : request received but no route defined in datastore index.js or routes/routes.js');
  let headers = request.headers;
  let method = request.method;
  let url = request.url;

  console.log('URL: ' + url + ', method: ' + method + ', headers: ' + JSON.stringify(headers));
  response.status(404).send({
    'error' : 'Routing endpoint not found',
    'request': {
       'URL': url,
       'method': method,
       'headers': headers
    }
  });
});

MongoClient.connect(url, options, (err, database) => {
  if (err) {
    console.log(`FATAL MONGODB CONNECTION ERROR: ${err}:${err.stack}`)
    process.exit(1)
  }
  app.locals.db = database.db('api')
  http.listen(port, '0.0.0.0', () => {
    console.log("Now listening on port " + port)
    app.emit('APP_STARTED')
  })
})

module.exports = app
