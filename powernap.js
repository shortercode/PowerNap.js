'use strict';

var http = require('http'),
	endpoint = require('./endpoint.js').endpoint,
	staticEndpoint = require('./static.js').staticEndpoint;

class powernap {
	
	constructor (port) {
		const endpoints = this.endpoints = [];
		http.createServer(
			function (req, res) {
				const request = powernap.parseRequest(req.url, req.method);
				console.log("[REQUEST]", JSON.stringify(request, null, 2));
				// find the first matching endpoint and execute
				for (var i = 0, l = endpoints.length; i < l; i++) {
					if (endpoints[i].match(request)) { 
						endpoints[i].run(request, res);
						return;
					}
				}
				endpoint.generateError(res, 500);
			}
		).listen(port);
	}
		
	endpoint (method, rgx, callback) {
		var route = new endpoint(method, rgx, callback);
		this.endpoints.push(route);
		return this;
	}
	
	staticEndpoint (rgx, root) {
		var route = new staticEndpoint(rgx, root);
		this.endpoints.push(route);
		return this;
	}
	
	static parseRequest (url, method) {
		var i, query, path, filename, ext;
		// remove anchor tag
		i = url.indexOf("#");
		path = ~i ? url.slice(0, i) : url;
		// remove query string
		i = path.indexOf("?");
		query = ~i ? path.slice(i + 1) : "";
		path = ~i ? path.slice(0, i) : path;
		// extract file name
		i = path.lastIndexOf("/");
		filename = ~i ? path.slice(i + 1) : "";
		// extract file extension
		i = filename.lastIndexOf(".");
		ext = ~i ? filename.slice(i + 1) : "";
		// return results
		return {
			query: query,
			path: path,
			ext: ext,
			filename: filename,
			method: method
		};
	}

}

exports.powernap = powernap;