'use strict';

var http = require('http'),
	Endpoint = require('./Endpoint.js'),
	StaticEndpoint = require('./StaticEndpoint.js');

class PowerNap {
	
	constructor (port) {
		const endpoints = this.endpoints = [];
		http.createServer(
			function (req, res) {
				console.time("[PARSE REQUEST]");
				const request = PowerNap.parseRequest(req);
				console.timeEnd("[PARSE REQUEST]");
				//console.log("[REQUEST]", JSON.stringify(request, null, 2));
				// find the first matching endpoint and execute
				for (var i = 0, l = endpoints.length; i < l; i++) {
					if (endpoints[i].match(request)) { 
						endpoints[i].run(request, res);
						return;
					}
				}
				// failed to find an endpoint
				Endpoint.generateError(res, 500);
			}
		).listen(port);
	}
		
	endpoint (method, rgx, callback) {
		var route = new Endpoint(method, rgx, callback);
		this.endpoints.push(route);
		return this;
	}
	
	staticEndpoint (rgx, root) {
		var route = new StaticEndpoint(rgx, root);
		this.endpoints.push(route);
		return this;
	}
	
	static parseRequest (req) {
		var url = req.url, method = req.method, i, query, path, filename, ext, body;
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
	
	static getBody (req) {
		return new Promise(function (res, rej) {
			var body = '';
			req.on('data', function (data) {
				console.log("Body data");
				body += data;
				// 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB
				if (body.length > 1e6) { 
					// FLOOD ATTACK OR FAULTY CLIENT, NUKE REQUEST
					req.connection.destroy();
					rej("Body exceeded length");
				}
			});
			req.on('end', function () {
				console.log("Body complete");
				res(body);
			});
			req.on('error', function (err) {
				console.log("Body error", err);
				rej(err);
			});
		});
	}

}

module.exports = PowerNap;