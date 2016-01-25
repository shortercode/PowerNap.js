'use strict';

class Endpoint {
	
	constructor (method, rgx, callback) {
		this.method = method.toUpperCase();
		this.callback = callback;
		if (typeof rgx === 'string') { // presumes a path
			if (~rgx.indexOf(":")) { // includes an optional parameter
				this.parameters = rgx.slice(1).split("/");
				this.parameters.forEach(function(cur, i, arr){
					if (cur.indexOf(":") === 0) {
						arr[i] = cur.slice(1);
					} else {
						arr[i] = "";
					}
				});
				this.rgx = new RegExp("^" + rgx.replace(/\/\:\w+/g, '\/([^\/]*)')); 
				// "^" to check if the string is at the start of the url
				// replacer allows the regex to part match any string where an optional parameter has been specified with a ":"
			} else {
				this.rgx = new RegExp("^" + rgx);
				this.parameters = []; 
			}
		} else if (rgx instanceof RegExp){ // any other regex match
			this.rgx = rgx;
			this.parameters = [];
		} else {
			throw TypeError("Endpoints must be either a RegExp or String");
		}
	}
	
	match (request) {
		return (this.method === request.method || this.method === "ALL") && this.rgx.test(request.path);
	}
	
	run (request, res) {
		this.getParameters(request);
		try {
			this.callback(request, res);
		} catch (e) {
			Endpoint.generateError(res, 500, "Failed to run command, syntax error in callback");
		}
	}
	
	getParameters (request) {
		for (var i = 0, parts = request.path.slice(1).split("/"), l = this.parameters.length; i < l; i++) {
			if (this.parameters[i]) {
				request.parameters[this.parameters[i]] = parts[i];
			}
		}
	}
		
	static generateError (res, code, statement) {
		res.statusCode = code;
		res.end(code + " " + statement);
	}
	
}

module.exports = Endpoint;