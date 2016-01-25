'use strict';

var mime = require('./mime.js'),
	Endpoint = require('./Endpoint.js'),
	fs = require('fs');
	
class StaticEndpoint extends Endpoint {
	
	constructor (str, root) {
		// match path & root MUST finish with a "/" for correct path construction
		if (/\/$/.test(str) === false) {
			str += "/";
		}
		if (/\/$/.test(root) === false) {
			root += "/";
		}
		super("get", str, function (request, res) {
			var localPath = request.path.slice(str.length); // remove the url match segment so "/public/myfile.js" can become "./www/myfile.js"
			if (request.ext === "") {
				// serve index
				if (this.index) {
					this.generateIndex(str, root + localPath, res);
				} else {
					StaticEndpoint.generateError(res, 404, "Indexing is disabled on this server");
				}
			} else {
				// attempt to serve file
				res.setHeader("Content-Type", mime(request.ext));
				var stream = fs.createReadStream(root + localPath);
				stream.on('error', function () {
					StaticEndpoint.generateError(res, 404, "Cannot read requested file");
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
		fs.readdir(path, function (err, files) {
			if (err) {
				StaticEndpoint.generateError(res, 404, "Cannot read requested directory");
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
						output.push("<li><a href=\"" + root + files[i] + "\">" + files[i] + "</a></li>");
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