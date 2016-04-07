'use strict';
const chalk = require('chalk');

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
			Endpoint.generateError(res, 500, "Failed to run command, syntax error in callback", e.stack || e);
		}
	}
	
	getParameters (request) {
		const parts = request.path.slice(1).split("/");
		const l = this.parameters.length;
		let i = 0;
		let parameterName;
		for (; i < l; i++) {
			parameterName = this.parameters[i];
			if (parameterName) {
				request.parameters[parameterName] = parts[i];
			}
		}
	}
	
	static generateLog (res, req) {
		const DATE = new Date().toLocaleString('en-GB');
		const TIME = process.hrtime(request.time);
		const CODE = res.statusCode;
		const COLOR = chalk[
			CODE > 500 ? 'bgRed' :
			CODE > 400 ? 'bgYellow' :
			CODE > 200 ? 'bgGreen' :
			'dim' // for whatever reason the request has completed with an odd status code
		];
		console.log(`${DATE} | ${COLOR(CODE)} | ${TIME[0] + TIME[1] / 1e9} | ${req.method} ${req.path}`);
	}
		
	static generateError (res, code, statement, request) {
		res.statusCode = code;
		res.end(code + " " + statement);
		request.error = statement;
	}
	
}

module.exports = Endpoint;