const express = require('express')

const router = express.Router()

/**
 * Retrieve a "type" of data (e.g. voltage_traces, progress_status) for the specified UUID.
 */
router.get('/collection/:id/:type', (request, response, next) => {
  const uuid = request.params.id;
  const type = request.params.type;

  // console.log('DEBUG : GET : uuid ' + uuid + ' TYPE ' + type);

  const collection = request.app.locals.db.collection(uuid);

  let return_status = 200;
  let return_obj;

  if (typeof collection !== 'undefined') {
    collection.findOne({
      'name': type
    }, (error, result) => {
      if (error) {
        return_status = 400;
        return_obj = { 'error' : error };
      } else {
        let default_type;
        if (type == 'voltage_traces' || type == 'progress_status' ||
            type == 'voltage_results') {
          default_type = {};
        } else if (type == 'STOP') {
          default_type = { 'success' : false };
        } else if (type == 'STDERR' || type == 'STDOUT' ) {
          default_type = { 'success' : false };
        } else {
          console.log('Oops! Unrecognised type requested -> ' + type);
        }

        if (result === null) {
          // No data yet!
          return_obj = default_type;
        } else if (result === undefined) {
          return_status = 400;
          return_obj = { 'error' : 'No document matching that id was found' };
        } else {
          if (type == 'STDERR' || type == 'STDOUT' ) {
            return_obj = (typeof result.content !== 'undefined') ? { 'success' : true, 'content': result.content } :
                         default_type;
          } else {
            return_obj = (typeof result.content !== 'undefined') ? { 'success' : result.content } :
                         default_type;
          }
        }
      }

      response.status(return_status).send(JSON.stringify(return_obj));
    })
  } else {
    return_status = 400;
    return_obj = { 'error' : 'No collection with uuid ' + uuid + ' was found' };
    response.status(return_status).send(JSON.stringify(return_obj));
  }
})

/**
 * Debugging option (e.g. prints to console!) to retrieve content of UUID.
 */
router.get('/collection/:id', (request, response, next) => {
  const uuid = request.params.id
  // console.log('DEBUG : GET : UUID ' + uuid);
  const collection = request.app.locals.db.collection(uuid);
  if (collection !== 'undefined') {
    collection.find({}, function(error, docs) {
      docs.each(function(error, doc) {
        if (doc) {
          console.log('');
          console.log('==============================================================');
          console.log(JSON.stringify(doc));
          console.log('==============================================================');
          console.log('');
        }
      })
    });
    response.status(200).send({'found':uuid});
  } else {
    response.status(400).send({'error':'No collection with uuid ' + uuid + ' was found'});
  }
})

/**
 * New "type" of simulation result (e.g. voltage_traces, progress_status) just arrived for UUID,
 * load into the datastore.
 */
router.post('/collection', (request, response, next) => {
  const uuid = request.body.uuid;
  const filetitle = request.body.filetitle;
  const contents = request.body.contents;
  const stop = request.body.stop;

  // console.log('DEBUG : POST : /collection uuid ' + uuid);

  if (stop == 'STOP') {
    request.app.locals.db.collection(uuid).findOneAndReplace(
      { name: 'STOP' },
      { name: 'STOP', content: true },
      { upsert: true }
    );
  } else {
    request.app.locals.db.collection(uuid).findOneAndReplace(
      { name: filetitle },
      { name: filetitle, content: contents },
      { upsert: true }
    );
  }
  response.status(200).send({'created':uuid})
});

/**
 * New simulation just invoked - prep the datastore for simulation results arrival.
 */
router.post('/collections', (request, response, next) => {
  const uuid = request.body.uuid;
  if (uuid !== 'undefined') {
    console.log('INFO : POST : Creating db collection @ uuid ' + uuid);
    request.app.locals.db.createCollection(uuid);
    response.status(200).send({
      'created' : uuid
    });
  } else {
    console.log('ERROR : /collections uuid was undefined!');
    response.status(400).send({'error': 'uuid was undefined!' });
  }
});

module.exports = router
