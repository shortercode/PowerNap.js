'use strict';

var mime = require('./mime.js'),
	Endpoint = require('./Endpoint.js'),
	fs = require('fs');
	
class StaticEndpoint extends Endpoint {
	
	constructor (rgx, root) {
		super("get", rgx, function (request, res) {
			if (request.ext === "") {
				// serve index
				if (this.index) {
					this.generateIndex(root, request.path, res);
				} else {
					StaticEndpoint.generateError(res, 404);
				}
			} else {
				// attempt to serve file
				res.setHeader("Content-Type", mime(request.ext));
				var stream = fs.createReadStream(root + request.path);
				stream.on('error', function () {
					StaticEndpoint.generateError(res, 404);
				});
				stream.on('open', function () {
					res.statusCode = 200;
				});
				stream.pipe(res);
			}
		});
		this.index = true;
	}
	
	generateIndex (root, path, res) {
		res.setHeader("Content-Type", mime("html"));
		fs.readdir(root + path, function (err, files) {
			if (err) {
				StaticEndpoint.generateError(res, 404);
			} else {
				res.statusCode = 200;
				var i = 0,
					l = files.length,
					output = [
						"<!DOCTYPE html>",
						"<html>",
						"<head>",
						"<style>",
						"</style>",
						"</head>",
						"<body>",
						"<ul>",
					];
				for (; i < l; i++) {
					if (files[i][0] !== ".") {
						output.push("<li><a href=\"" + path + files[i] + "\">" + files[i] + "</a></li>");
					}
				}
				output.push("</ul>")
				output.push("</body>");
				output.push("</html>");
				res.end(output.join("\n"));
			}
		});
	}
	
}

module.exports = StaticEndpoint;