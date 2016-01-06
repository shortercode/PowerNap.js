'use strict';

class endpoint {
	
	constructor (method, rgx, callback) {
		this.method = method.toUpperCase();
		this.rgx = new RegExp(rgx);
		this.callback = callback;
	}
	
	match (request) {
		return (this.method === request.method || this.method === "ALL") && this.rgx.test(request.path);
	}
	
	run (request, res) {
		try {
			this.callback(request, res);
		} catch (e) {
			endpoint.generateError(res, 500);
		}
	}
		
	static generateError (res, code) {
		res.statusCode = code;
		res.end(code + "");
	}
	
}

exports.endpoint = endpoint;