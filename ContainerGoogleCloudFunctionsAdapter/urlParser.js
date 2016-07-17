
/*
Parsing a proto file for an URL (for an fucntionName) positioned behind the function description
*/
function parseProtoFileForURL(protoFilePath, functionName) {
	
	// load .proto file
	var fileSystem = require('fs');
	var protoFile = fileSystem.readFileSync(protoFilePath).toString().split("\n");
	
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
	
	return cloudFunctionURL;
}


// start the main function
var url = parseProtoFileForURL("D:/edu/master/fs4/fp_caam/cloud-fapra/assignment4/grpcCloudFunctions/main.proto", "getOrderDetails");
console.log(url);