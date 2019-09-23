/**
 * Serve app-manager operations.
 */
"use strict";

const exec = require('child_process').exec;
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const uuidv4 = require('uuid/v4');
const chokidar = require('chokidar');
const request = require('request');
const ip = require('ip');

// These directory names are also referenced in other scripts!
const DIR_APPREDICT_RESULTS = concatenator([ __dirname, 'res'], false);
const DIR_APPREDICT_RUN = concatenator([ __dirname, 'run'], false);

// It is assumed that the REST_API_URL_DATA value (if defined) ends with a '/'!
var rest_api_url_data;
const REST_API_URL_COLLECTION = 'api/collection';
const REST_API_URL_COLLECTIONS = 'api/collections';

const RUNME_SCRIPT = './run_me.sh';

/**************************** Function declarations ***************************/

function process_associated_data(associated_item) {
  if (typeof associated_item === 'undefined') {
    return;
  }
  var associated_data = associated_item.associatedData;
  var spreads = associated_item.spreads;

  var pIC50s = [];
  var hills = [];
  var saturations = [];
  associated_data.forEach((associated_item) => {
    pIC50s.push(associated_item.pIC50);
    hills.push(associated_item.hill);
    saturations.push(associated_item.saturation);
  });

  return {
    'spreads': spreads,
    'pIC50s': pIC50s.join(' '),
    'hills': hills.join(' '),
    'saturations': saturations.join(' ')
  }
}
/**
 * Perform an asynchronous invocation of the script which kicks of ApPredict.
 *
 * @param appredict_input JSON representation of ApPredict input.
 * @param simulation_id Simulation identifier.
 * @return The object representing the completion (or failure).
 */
function call_invoke(appredict_input, simulation_id) {
  return new Promise((resolve, reject) => {
    var model_id = appredict_input.modelId;
    var pacing_frequency = appredict_input.pacingFrequency;
    var pacing_max_time = appredict_input.pacingMaxTime;

    var pIC50s_IKr;
    var hills_IKr;
    var saturations_IKr;
    var pIC50s_INa;
    var hills_INa;
    var saturations_INa;
    var pIC50s_ICaL;
    var hills_ICaL;
    var saturations_ICaL;
    var pIC50s_IKs;
    var hills_IKs;
    var saturations_IKs;
    var pIC50s_IK1;
    var hills_IK1;
    var saturations_IK1;
    var pIC50s_Ito;
    var hills_Ito;
    var saturations_Ito;

    var data_IKr = process_associated_data(appredict_input.IKr);
    if (typeof data_IKr !== 'undefined') {
      pIC50s_IKr = data_IKr.pIC50s;
      hills_IKr = data_IKr.hills;
      saturations_IKr = data_IKr.saturations;
    }
    var data_INa = process_associated_data(appredict_input.INa);
    if (typeof data_INa !== 'undefined') {
      pIC50s_INa = data_INa.pIC50s;
      hills_INa = data_INa.hills;
      saturations_INa = data_INa.saturations;
    }
    var data_ICaL = process_associated_data(appredict_input.ICaL);
    if (typeof data_ICaL !== 'undefined') {
      pIC50s_ICaL = data_ICaL.pIC50s;
      hills_ICaL = data_ICaL.hills;
      saturations_ICaL = data_ICaL.saturations;
    }
    var data_IKs = process_associated_data(appredict_input.IKs);
    if (typeof data_IKs !== 'undefined') {
      pIC50s_IKs = data_IKs.pIC50s;
      hills_IKs = data_IKs.hills;
      saturations_IKs = data_IKs.saturations;
    }
    var data_IK1 = process_associated_data(appredict_input.IK1);
    if (typeof data_IK1 !== 'undefined') {
      pIC50s_IK1 = data_IK1.pIC50s;
      hills_IK1 = data_IK1.hills;
      saturations_IK1 = data_IK1.saturations;
    }
    var data_Ito = process_associated_data(appredict_input.Ito);
    if (typeof data_Ito !== 'undefined') {
      pIC50s_Ito = data_Ito.pIC50s;
      hills_Ito = data_Ito.hills;
      saturations_Ito = data_Ito.saturations;
    }

    //var pIC50s_IKr = process_pIC50s(appredict_input.pIC50sIKr);
    //var pIC50s_INa = process_pIC50s(appredict_input.pIC50sINa);
    //var pIC50s_ICaL = process_pIC50s(appredict_input.pIC50sICaL);
    //var pIC50s_IKs = process_pIC50s(appredict_input.pIC50sIKs);
    //var pIC50s_IK1 = process_pIC50s(appredict_input.pIC50sIK1);
    //var pIC50s_Ito = process_pIC50s(appredict_input.pIC50sIto);

    var plasma_max = appredict_input.plasmaMaximum;
    var plasma_min = appredict_input.plasmaMinimum;
    var plasma_intermediate_point_count = appredict_input.plasmaIntermediatePointCount;
    var plasma_intermediate_log_scale = appredict_input.plasmaIntermediatePointLogScale;

    var input_plasma_points = appredict_input.plasmaPoints;

    var plasma_points;
    if (typeof input_plasma_points !== 'undefined' && Array.isArray(input_plasma_points)) {
      plasma_points = input_plasma_points.join(' ');
    }

    // TODO: Improve provisional user-input verification!
    var has_plasma_points = false;
    if (typeof plasma_points !== 'undefined') {
      has_plasma_points = true;

      plasma_max = null;
      plasma_min = null;
      plasma_intermediate_point_count = null;
      plasma_intermediate_log_scale = null;
    } else {
      // https://stackoverflow.com/questions/18082/validate-decimal-numbers-in-javascript-isnumeric
      if (![plasma_max, plasma_min, plasma_intermediate_point_count].every((element) => {
              return (element == '' || typeof element !== 'undefined' ||
                      !isNaN(parseFloat(element)) && isFinite(element));
            }) ) {
        console.log('WARN1.1 : Non-numeric encountered! : ' + JSON.stringify(appredict_input));

        return;
      }
    }

    /*
    if (![pIC50s_IKr, pIC50s_INa, pIC50s_ICaL,pIC50s_IKs, pIC50s_IK1, pIC50s_Ito].every((element) => {
            return (element == '' || typeof element === 'undefined' || typeof element !== 'undefined '&& 
                    !isNaN(parseFloat(element)) && isFinite(element));
           }) ) {
      console.log('WARN1.2 : Non-numeric encountered! : ' + JSON.stringify(appredict_input));

      return;
    }
    */

    if (![model_id, pacing_frequency, pacing_max_time].every((element) => {
            return (element == '' || typeof element !== 'undefined' ||
                    !isNaN(parseFloat(element)) && isFinite(element));
          }) ) {
      console.log('WARN1.3 : Non-numeric encountered! : ' + JSON.stringify(appredict_input));

      return;
    }
    if (!has_plasma_points && typeof plasma_intermediate_log_scale !== 'boolean') {
      console.log('WARN1.4 : Expected boolean primitive for plasma_intermediate_log_scale! : ' + JSON.stringify(appredict_input));

      return;
    }

    var args = '--model ' + model_id + ' ';
    if (pacing_frequency !== undefined) {
      args += '--pacing-freq ' + pacing_frequency + ' ';
    }
    if (pacing_max_time !== undefined) {
      args += '--pacing-max-time ' + pacing_max_time + ' ';
    }
    if (has_plasma_points) {
        args += '--plasma-concs ' + plasma_points + ' ';
    } else {
      if (plasma_max !== undefined) {
        args += '--plasma-conc-high ' + plasma_max + ' ';
      }
      if (plasma_min !== undefined) {
        args += '--plasma-conc-low ' + plasma_min + ' ';
      }
      if (plasma_intermediate_point_count !== undefined) {
        args += '--plasma-conc-count ' + plasma_intermediate_point_count + ' ';
      }
      if (plasma_intermediate_log_scale !== undefined) {
        args += '--plasma-conc-logscale ' + plasma_intermediate_log_scale + ' ';
      }
    }

    if (pIC50s_IKr !== undefined && pIC50s_IKr != '') {
      args += '--pic50-herg ' + pIC50s_IKr + ' ';
      args += '--hill-herg ' + hills_IKr + ' ';
      args += '--saturation-herg ' + saturations_IKr + ' ';
    }
    if (pIC50s_INa !== undefined && pIC50s_INa != '') {
      args += '--pic50-na ' + pIC50s_INa + ' ';
      args += '--hill-na ' + hills_INa + ' ';
      args += '--saturation-na ' + saturations_INa + ' ';
    }
    if (pIC50s_ICaL !== undefined && pIC50s_ICaL != '') {
      args += '--pic50-cal ' + pIC50s_ICaL + ' ';
      args += '--hill-cal ' + hills_ICaL + ' ';
      args += '--saturation-cal ' + saturations_ICaL + ' ';
    }
    if (pIC50s_IKs !== undefined && pIC50s_IKs != '') {
      args += '--pic50-iks ' + pIC50s_IKs + ' ';
      args += '--hill-iks ' + hills_IKs + ' ';
      args += '--saturation-iks ' + saturations_IKs + ' ';
    }
    if (pIC50s_IK1 !== undefined && pIC50s_IK1 != '') {
      args += '--pic50-ik1 ' + pIC50s_IK1 + ' ';
      args += '--hill-ik1 ' + hills_IK1 + ' ';
      args += '--saturation-ik1 ' + saturations_IK1 + ' ';
    }
    if (pIC50s_Ito !== undefined && pIC50s_Ito != '') {
      args += '--pic50-ito ' + pIC50s_Ito + ' ';
      args += '--hill-ito ' + hills_Ito + ' ';
      args += '--saturation-ito ' + saturations_Ito + ' ';
    }

    console.log('DEBUG : ApPredict args : ' + args);

    var run_dir = concatenator( [ DIR_APPREDICT_RUN, simulation_id], false);
    var res_dir = concatenator( [ DIR_APPREDICT_RESULTS, simulation_id], false);

    exec(RUNME_SCRIPT + ' ' + run_dir + ' ' + res_dir + ' ' + args, (error, stdout, stderr) => {
          // TODO : If we're not capturing run_me.sh output in the shell script then should at least
          //        be providing a mechanism here to return simulation stdout/stderr output to the UI.
          if (stdout) {
            console.log('DEBUG : ** ' + simulation_id + ' : ApPredict stdout follows *****');
            console.log(stdout);
            console.log('********************************************************************************');
          }
          if (stderr) {
            // Possible causes:
            //   1. Can't find ApPredict.sh (maybe app-manager not started in container)
            //   2. Simulation crashed during processing.
            console.log('ERR01 : ** ' + simulation_id + ' : ApPredict stderr follows *****');
            console.log(stderr);
            console.log('********************************************************************************');
          }
          if (error !== null) {
            console.log('ERR02 : ' + error);
            reject(error);
          }
          resolve(stdout || stderr);
        });
  });
};

/**
 * Incoming formats are ..
 * <ul>
 *   <li>CSV, e.g. "4.4300000000,4.1994589303,4.1834193885,4.1759209425,3.0693805212,4.0000000000"</li>
 *   <li>An array of values</li>
 *   <li>Single value</li>
 * </ul>
 * 
 * @param pIC50s
 * @returns String of values.
 */
function process_pIC50s(pIC50s) {
  var returned;

  if (typeof pIC50s !== 'undefined') {
    // Appears to be a value declaration of some sort!
    if (Array.isArray(pIC50s)) {
      // Array for splitting.
      if (numbers(pIC50s)) {
        returned = pIC50s.join(' ');
      } 
    } else {
      // Assume string
      if (typeof pIC50s === 'string' || pIC50s instanceof String) {
        if (pIC50s.indexOf(',') == -1) {
          // Single value
          if (numbers([ pIC50s ])) {
            returned = pIC50s;
          }
        } else {
          // CSV
          var arrayed = pIC50s.split(',');
          if (numbers(pIC50s.split(','))) {
            returned = arrayed.join(' ');
          }
        }
      } else {
        console.log('ERR09 - cannot determine format of ' + pIC50s);
      }
    }
  }

  return returned;
}

function numbers(arr) {
  if (!arr.every((element) => {
        return (typeof element !== 'undefined' && element.trim() != '' &&
                !isNaN(parseFloat(element)) && isFinite(element));
      })) {

    console.log('WARN1.2 : Non-numeric encountered! : ' + JSON.stringify(arr));
    return;
  }
  return true;
}

/**
 * Build up a directory path with native path separator.
 * 
 * @param string_arr String array to concatenate.
 * @param append_separator `true` if to append a native path separator, otherwise `false`.
 * @returns Concatenated string.
 */
function concatenator(string_arr, append_separator) {
  var concatenated = string_arr.join(path.sep);
  if (append_separator) {
    concatenated += path.sep;
  }
  return concatenated;
}

/**
 * Handle a URL response.
 * 
 * @param origin Calling function name/identifier.
 * @param url URL responded to.
 * @param error Optional error message received.
 * @param response Response received.
 * @param body Body received.
 */
function handle_data_response(origin, url, error, response, body) {
  if (typeof response !== 'undefined' &&                   /* datastore is offline? */
      typeof response.statusCode !== 'undefined' &&
      response.statusCode == 200) {
    // console.log('DEBUG : Everything ok!!');
  } else {
    if (error) {
      if (typeof error === 'object') {
        var errno = error.errno;
        if (typeof errno !== 'undefined' && errno == 'ECONNREFUSED') {
          // Indicative of data url being inaccessible! May be a transitory problem on startup!
          var error_msg = 'ERR03 : ' + url + ' : Cannot connect to ' + error.address + ':' + error.port;
          console.error(error_msg);
        } else {
          console.error('ERR03 : ' + url + ' : ' + JSON.stringify(error));
        }
      } else {
        console.error('ERR03 : ' + url + ' : ' + error);
      }
      return;
    }
    console.log('WARN2 : Response : ' + JSON.stringify(response));
    console.log('WARN2 : Body : ' + JSON.stringify(body));
  }
}

/**
 * Run ApPredict via an asynchronous function call.
 *
 * @param appredict_input ApPredict json-format input values.
 * @param simulation_id Simulation identifier.
 */
async function run_appredict(appredict_input, simulation_id) {
  try {
    await call_invoke(appredict_input, simulation_id);
  } catch (error) {
    console.log('ERR03 : ' + error);
  }
}

/**
 * React when convert.sh has written a new directory.
 *
 * @param directory_path Just-created directory path.
 */
function on_add_dir(directory_path) {
  var path_components = directory_path.split(path.sep);
  var last_component = path_components[path_components.length - 1];
  // Look for a UUID as the last component in the directory name.
  if (/^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i.test(last_component)) {
    var uuid = last_component;

    // Create a new record in the data store for this simulation id.
    var url = rest_api_url_data + REST_API_URL_COLLECTIONS;
    request.post({
      url: url,
      body: { 'uuid': uuid },
      json: true
    }, (error, response, body) => {
      handle_data_response('on_add_dir', url, error, response, body);
    });
  }
}

/**
 * React when convert.sh has written a new file.
 *
 * Added files are usually created empty so generally not of much concern to
 * the application - it's usually the "change" event signifying data being 
 * written to the file which is useful.

 * @param file_path Just-created file.
 */
function on_file_add(file_path) {
  var path_components = file_path.split(path.sep);
  var third_last_component = path_components[path_components.length - 3];
  // Look for a UUID as the third-to-last component in the file path
  if (/^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i.test(third_last_component)) {
    var uuid = third_last_component;

    /* We're actually only interested in the appearance of the file which
       indicates that ApPredict has stopped running. */
    var file_name = path.basename(file_path);
    var url = rest_api_url_data + REST_API_URL_COLLECTION;
    if (/^STOP$/i.test(file_name)) {
      request.post({
        url: url,
        body: {
          'uuid': uuid,
          'stop': 'STOP'
        },
        json: true
      }, (error, response, body) => {
        handle_data_response('on_file_add', url, error, response, body);
      });
    }
  }
}

/**
 * React when convert.sh has changed a file.
 *
 * This usually means when data actually appears in the file, rather than when
 * the (initially empty) file is added. This difference may be important if
 * directly creating files in run_me.sh.
 *
 * @param file_path Just-changed file.
 */
function on_file_change(file_path) {
  var path_components = file_path.split(path.sep);
  var third_last_component = path_components[path_components.length - 3];
  // Look for a UUID as the third-to-last component in the file path
  if (/^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i.test(third_last_component)) {
    var uuid = third_last_component;

    var file_name = path.basename(file_path);
    // Does it have the json file extension?
    if (/\.json$/i.test(file_name)) {
      var file_name_no_ext = path.basename(file_path, '.json');

      var send_data = true;
      if (/^progress_status$/i.test(file_name_no_ext)) {
      } else if (/^voltage_results$/i.test(file_name_no_ext)) {
      } else if (/^conc_.*_voltage_trace$/i.test(file_name_no_ext)) {
      } else if (/^voltage_traces$/i.test(file_name_no_ext)) {
      } else {
        send_data = false;
        console.log('WARN3 : Unrecognised file title of ' + file_name_no_ext + ' for id ' + uuid + '!');
      }

      if (send_data) {
        fs.readFile(file_path, { encoding: 'utf-8' }, (error, contents) => {
          if (error) {
            console.log('ERR04 : File read : ' + file_path + ' ' + error);
          } else {
            let parsed;
            let send_it = true;
            try {
              parsed = JSON.parse(contents);
            } catch (e) {
              // Can occur quite frequently 
              let show_contents = contents.length > 100 ?
                                  contents.substring(0, 99) + '.... <-- truncated!' :
                                  contents;
              console.log('INFO1 : ' + file_path + ' ignore invalid JSON ...' + show_contents);
              send_it = false;
            }

            if (send_it) {
              var url = rest_api_url_data + REST_API_URL_COLLECTION;
              request.post({
                url: url,
                body: {
                  'uuid': uuid,
                  'filetitle': file_name_no_ext,
                  'contents': parsed
                },
                json: true
              }, (error, response, body) => {
                handle_data_response('on_file_change', url, error, response, body);
              });
            }
          }
        });
      }
    }
  }
}

/**
 * Watch files not in "ApPredict_output/" in the "run" directory (convert.sh does
 * that!), but instead files and directories in the "results" directory which
 * convert.sh creates and writes out to in json format.
 *
 * This watcher behaves as a "push" mechanism when the application deployment
 * includes the optional intermediary REST API data store between client-direct
 * and app-manager.
 */
function watch_results_files() {
  console.log('DEBUG : Watching ' + DIR_APPREDICT_RESULTS);
  var watcher = chokidar.watch(DIR_APPREDICT_RESULTS, {
    ignored: /(^|[\/\\])\../,
    persistent: true
  });

  watcher.on('add', path => on_file_add(path))
         .on('change', path => on_file_change(path))
         .on('addDir', path => on_add_dir(path))
         .on('error', error => console.log('ERR05 : Watcher : ' + error ))
}

/******************************************************************************/

if (typeof process.env.REST_API_URL_DATA !== 'undefined' && process.env.REST_API_URL_DATA != '') {
  rest_api_url_data = process.env.REST_API_URL_DATA;
  if (rest_api_url_data[rest_api_url_data.length - 1] != '/') {
    rest_api_url_data = rest_api_url_data + '/';
    console.log('INFO2 : REST_API_URL_DATA adjusted to append trailing forward-slash.');
  }
  console.log('INFO2 : REST_API_URL_DATA defined in ENV vars. Using: ' + rest_api_url_data);
  // "pushing" of data to a REST API data repository requires the URL be assigned.
  setTimeout(watch_results_files, 1000);
} else {
  console.log('INFO2 : REST_API_URL_DATA not defined in ENV vars. Assuming client-direct querying directly.');
}

function send_resp(response, return_obj) {
  response.end(JSON.stringify(return_obj));
}

const server = http.createServer((request, response) => {
  // Object to return to caller.
  var return_obj = {};

  console.log('DEBUG : Request headers : ' + JSON.stringify(request.headers));
  if (request.method == 'POST') {
    var simulation_id = uuidv4();

    let body = [];
    request.on('data', (data) => {
      body.push(data);
      /* 
       * If there's more than 1024 bytes arriving via a curl command then see 
       * https://stackoverflow.com/questions/463144/php-http-post-fails-when-curl-data-1024
       * which illustrates the necessity to add the "Expect:" header, e.g.
       * `curl --header "Expect: " --header "Content-Type:application/json" -X POST -d @request.json http://192.168.0.20:8080/`
       */
    }).on('end', () => {
      /* https://nodejs.org/es/docs/guides/anatomy-of-an-http-transaction/ */
      body = Buffer.concat(body).toString();

      /* Example body: {"created":1550659422962,"modelId":8,"pacingFrequency":1,"pacingMaxTime":5,.... */
      try {
        var parsed = JSON.parse(body);
      } catch (error) {
        var error_msg = 'Could not parse POSTed body!: ' + body;
        console.log('ERR06 : ' + error_msg);
        // TODO: Consider writing error to a file (for GET retrieval).
      }

      if (typeof parsed !== 'undefined') {
        run_appredict(parsed, simulation_id);
      }

      console.log('DEBUG : Request body : ' + body);
    });

    /*
     * Going to ask for client to close connection after container has kicked off a simulation.
     * If the client is a browser it's more than likely Connection will be 'keep-alive'
     * which if there's app-manager replication, it will cause all simulation requests to end
     * up hitting the same container (until the keep-alive timeout is reached, e.g. 115 seconds
     * on FF I think - see about:config).
     */
    response.writeHead(200, {
      'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, cache-control, pragma, expires, connection',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Origin': '*',
      'Connection': 'close',
      'Content-Type': 'application/json' });

    /*
     * Simply receiving a simulation request is considered a "success"!
     * Even if run_appredict wasn't even called (i.e. no request data event
     *   triggered -- see above) it'll return "success"!
     * TODO: Improve feedback of problems to calling client mechanism!
     */
    return_obj = {
      'success': {
        'id': simulation_id,
        'ip': ip.address()
      }
    };

    // Sending a string while header saying "it's json" is ok!
    response.end(JSON.stringify(return_obj));
    //setTimeout(function () { send_resp(response, return_obj) }, 2000);
  } else if (request.method == 'GET') {
    /* Example URL: http://127.0.0.1:8080/api/collection/63fba96a-5b2e-4744-8be9-816fbffeebb8/voltage_traces
       The "api/collection/" is used so that client-direct has consistency in
       URL structure between direct app-manager <=> client-direct results/
       progress querying, and similarly via an intermediary REST API data store. */
    var pathname_data = url.parse(request.url, true).pathname;
    var components = pathname_data.split(path.sep);

    if (components.length > 4) {
      // Note: pathname_data should have started with a '/'!
      var simulation_id = components[3];
      var operation = components[4];
    }

    if (typeof simulation_id !== 'undefined') {

      var results_pfx = concatenator([ DIR_APPREDICT_RESULTS, simulation_id, 'ApPredict_output' ],
                                     true);

      if (typeof operation !== 'undefined') {
        switch (operation) {
          case 'STOP':
            var stopped_file = results_pfx += 'STOP';
            try {
              fs.readFileSync(stopped_file);
              return_obj = {
                'success': true
              };
            } catch (error) {
              // Ignore "file doesn't exist!" errors (as file only appears when ApPredict stops!)
              if (!error.message.startsWith('ENOENT:')) {
                return_obj = {
                  'error': 'Problem reading ' + stopped_file + ' (Caused by: ' + error.message + ')'
                }
              }
            }
            break;
          case 'voltage_results':
          case 'voltage_traces':
          case 'progress_status':
            var json_file_path = results_pfx += operation + '.json';
            try {
              // Try parsing first to make sure that it's valid JSON.
              return_obj = {
                'success': JSON.parse(fs.readFileSync(json_file_path))
              };
            } catch (error) {
              // Ignore "file doesn't exist!" errors (as such files take time to appear!)
              if (!error.message.startsWith('ENOENT:')) {
                return_obj = {
                  'error': 'Problem reading ' + json_file_path + ' (Caused by: ' + error.message + ')'
                }
              }
            }
            break;
          default:
            return_obj = {
              'error': 'Valid data query options are: "STOP", "voltage_traces", "voltage_results" and "progress_status"'
            }
            break;
        }
      } else {
        return_obj = {
          'error': 'No data query option (e.g. "voltage_traces", "progress_status") found in ' + pathname_data
        }
      }
    } else {
      return_obj = {
        'error': 'No simulation id found in ' + pathname_data
      }
    }

    if (typeof return_obj.error !== 'undefined') {
      console.log('ERR07 : ' + return_obj.error);
    }

    response.writeHead(200, {
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
      'Content-Type': 'text/plain; charset=utf-8'
    });
    // We're returning text!
    response.end(JSON.stringify(return_obj));
    response.setTimeout(5);
  } else if (request.method == 'OPTIONS') {
    /*
     * In the CORS world there are certain client request combos (e.g. a POST with some data)
     * which spark a 'preflight' request - This is to handle such.
     * {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS}
     */
    response.writeHead(200, {
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, cache-control, pragma, expires, connection',
      'Content-Type': 'text/plain; charset=utf-8'
    });
    response.end('');
  } else {
    response.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, cache-control, pragma, expires, connection',
      'Content-Type': 'text/plain; charset=utf-8'
    });
    var error_msg = 'app-manager accepts GET/POST/OPTIONS only!';
    console.log('ERR08 : ' + error_msg);
    return_obj = {
      'error': error_msg
    }
    response.end(JSON.stringify(return_obj));
  }
});

const port = 8080;
const host = '0.0.0.0';
server.listen(port, host);
console.log('INFO3 : app-manager listening at http://' + host + ':' + port);
