'use strict';

var http = require('http'),
	Endpoint = require('./Endpoint.js'),
	StaticEndpoint = require('./StaticEndpoint.js');

class PowerNap {
	
	constructor (port) {
		const endpoints = this.endpoints = [];
		http.createServer(
			function (req, res) {
				const request = PowerNap.parseRequest(req);
				// find the first matching endpoint and execute
				for (var i = 0, l = endpoints.length; i < l; i++) {
					if (endpoints[i].match(request)) { 
						endpoints[i].run(request, res);
						return;
					}
				}
				// failed to find an endpoint
                request.request = null;
				Endpoint.generateError(res, 500, "Failed to match endpoint, no matching RegExp\n", JSON.stringify(request, null, 4));
			}
		).listen(port);
	}
		
	endpoint (method, rgx, callback) {
		var route = new Endpoint(method, rgx, callback);
		this.endpoints.push(route);
		return route;
	}
	
	staticEndpoint (rgx, root) {
		var route = new StaticEndpoint(rgx, root);
		this.endpoints.push(route);
		return route;
	}
	
	static parseRequest (req) {
		var url = decodeURI(req.url), method = req.method, i, query, path, filename, ext;
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
			method: method,
			request: req,
			parameters: {}
		};
	}
	
	static getBody (req, sizeLimit) {
		return new Promise(function (res, rej) {
			var body = '';
			sizeLimit = sizeLimit || 1e6; // default limit is ~ 1MB
			req.on('data', function (data) {
				body += data;
				if (body.length > sizeLimit) { // bad request, bail! 
					req.connection.destroy();
					body = null;
					rej("Body exceeded size limit");
				}
			});
			req.on('end', function () {
				res(body);
			});
			req.on('error', function (err) {
				rej(err);
			});
		});
	}

}

module.exports = PowerNap;