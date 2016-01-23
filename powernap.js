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
                console.log("[PROCESSING REQUEST] " + request.method + " " + request.path);
				console.time("[REQUEST EXECUTION TIME]" + request.path);
				// find the first matching endpoint and execute
				for (var i = 0, l = endpoints.length; i < l; i++) {
					if (endpoints[i].match(request)) { 
						console.log("[MATCHED ENDPOINT] " + endpoints[i].rgx);
						endpoints[i].run(request, res);
						console.timeEnd("[REQUEST EXECUTION TIME]" + request.path);
						return;
					}
				}
				// failed to find an endpoint
				Endpoint.generateError(res, 500);
				console.timeEnd("[REQUEST EXECUTION TIME]" + request.path);
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
		var url = decodeURI(req.url), method = req.method, i, query, path, filename, ext, body;
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
		// get request body
		//body = PowerNap.getBody (req);
		// return results
		return {
			query: query,
			path: path,
			ext: ext,
			filename: filename,
			method: method,
			request: req
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