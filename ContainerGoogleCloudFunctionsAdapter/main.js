// imports
var grpc = require('grpc');
var request = require('request');
var fileSystem = require('fs');
var cmd=require('node-cmd');

function main() {
  console.log('Setting environment variables');
  // default proto file path
  var protoFilePath = '/api/main.proto';
  if (process.env.API_PROTO_PATH != null) {
    protoFilePath = process.env.API_PROTO_PATH;
  }
  var protoFile = fileSystem.readFileSync(protoFilePath).toString().split("\n");
  console.log('Using ' + protoFilePath + ' as proto file.');
  // default port
  var port = 50005;
  if (process.env.API_PORT != null) {
    port = process.env.API_PORT;
  }
  console.log('Using port: ' + port + '\n');

  // load the proto file in memory
  var grpcPackage = grpc.load(protoFilePath);

  // get functions
  serviceFunctions = GetFunctionNames(grpcPackage);

  // map functions to URLs
  for (var srv in serviceFunctions) {
    var packageService = serviceFunctions[srv];

    for (var i = 0; i < packageService.length; i++) {
      var serviceFunction = packageService[i];
	  //TODO parse for actual urls in proto file - serviceFunction.name contains name of the function
      serviceFunction['URL'] = parseProtoFileForURL(protoFile, serviceFunction.name);
    }
  }

  // create the server
  server = new grpc.Server();

  // send POST request to the given url
  CallGcloud = function (gcloudURL, sendData, callback) {
    console.log('Sending ' + JSON.stringify(sendData) + ' to ' + gcloudURL);
    var options = { url: gcloudURL, json: sendData };

    request.post(options, function (error, response, body) {
      var json;
      if (!error && response.statusCode == 200) {
        console.log('Received:');
        console.log(body);
        json = body;
      } else {
        console.log('Received error from gcloud');
      }

      try {
        callback(null, json);
      } catch (err) {
        console.log('Error returning result: ' + err);
        callback(true, null);
      }
      console.log('Processed request\n');
    });
  }

  // create handler functions for serviceFunctions
  var grpcHandlers = {};
  for (var srv in serviceFunctions) {
    var packageService = serviceFunctions[srv];
    console.log('Create handler for ' + srv);

    var callHandlers = {};
    for (var i = 0; i < packageService.length; i++) {
      var serviceFunction = packageService[i];
      var methodBody = CreateRequestHandlerFunction(serviceFunction);
      var handler = Function("call", "callback", methodBody);
      callHandlers[serviceFunction.name] = handler;
    }

    var serviceObject = grpcPackage[packageService[0].parent.parent.name][packageService[0].parent.name].service;
    grpcHandlers[srv] = callHandlers;
    server.addProtoService(serviceObject, callHandlers);
  }

  // start the server
  server.bind("0.0.0.0:" + port, grpc.ServerCredentials.createInsecure());
  server.start();
  console.log('started grpc server at ' + port + '\n');
}

function parseProtoFileForURL(protoFile, functionName) {
	// URL for the cloud function
	var functionURLRegex = new RegExp('^\\s*rpc\\s(' + functionName + ').*;\\s?\\/\\/\\s?@URL=(https?:\\/\\/?[\\da-z\\.-]+\\.[a-z\\.]{2,6}([\\/\\w \\.-]*)*\\/?)$');
	var cloudFunctionURL = "";

    protoFile.forEach(function(line){
		urlMatch = functionURLRegex.exec(line);
    	if (urlMatch){
    		// read out the URL
			cloudFunctionURL = urlMatch[2];
    	}
	});

	if (cloudFunctionURL == "") {
		return new Error("Found no URL for function " + functionName + " in proto file!")
	} else {
		return cloudFunctionURL;
	}
}

function CreateRequestHandlerFunction(fnct) {
  //TODO hier generieren von methodenrümpfen und call via CallGcloud
  var body = 'console.log("\\nRequest received for function: ' + fnct.name + '");' +
  'var returnObject = CallGcloud(\'' + fnct.URL + '\', call.request, callback);';
  return body;
}

// get all functions from the proto file
function GetFunctionNames(proto) {
  console.log('Searching for functions in the proto file');
  var functions = {};

  for (var pckg in proto) {
    var pckgObject = proto[pckg];
    console.log('Found package: ' + pckg);

    for (var child in pckgObject) {
      var item = pckgObject[child];
      if (item.service) {
        var srv = item.service;
        console.log('Found service: ' + srv.name);

        var srvFunctions = [];
        for (var functionChild in srv.children) {
          var fnct = srv.children[functionChild];
          srvFunctions.push(fnct);
          console.log('Found function: ' + fnct.name);
        }

        functions[pckg + '.' + srv.name] = srvFunctions;
      }
    }
  }
  console.log('Finished searching for functions in the proto file\n');

  return functions;
}

// start the main function
main();
