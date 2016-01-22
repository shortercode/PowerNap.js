'use strict';

class Endpoint {
	
	constructor (method, rgx, callback) {
		this.method = method.toUpperCase();
		this.callback = callback;
		if (typeof rgx === 'string') { // presumes a path
			this.rgx = new RegExp("^" + rgx); // "^" to check if the string is at the start of the request
		} else if (rgx instanceOf RegExp){ // any other regex match
			this.rgx = rgx;
		} else {
			throw TypeError("Endpoints must be either a RegExp or String");
		}
	}
	
	match (request) {
		return (this.method === request.method || this.method === "ALL") && this.rgx.test(request.path);
	}
	
	run (request, res) {
		try {
			this.callback(request, res);
		} catch (e) {
			Endpoint.generateError(res, 500);
		}
	}
		
	static generateError (res, code) {
		res.statusCode = code;
		res.end(code + "");
	}
	
}

module.exports = Endpoint;