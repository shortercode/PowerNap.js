'use strict';

const http = require('http'),
	Endpoint = require('./Endpoint.js'),
	StaticEndpoint = require('./StaticEndpoint.js');

class PowerNap
{
	constructor(port)
	{
		this.endpoints = [];
		http.createServer(
				(req, res) =>
				{
					// parse the request for general details
					const request = PowerNap.parseRequest(req);
					// add listener for endpoint completion
					res.on('finish', () => Endpoint.generateLog(res, request));
					// find the first matching endpoint and execute
					for (let endpoint of this.endpoints)
					{
						if (endpoint.match(request))
						{
							endpoint.run(request, res);
							// exit now to avoid the error case following the search
							return;
						}
					}
					// failed to find an endpoint
					Endpoint.generateError(res, 500, "Failed to match endpoint, no matching RegExp", request);
				}
			)
			.listen(port);
	}

	endpoint(method, rgx, callback)
	{
		const route = new Endpoint(method, rgx, callback);
		this.endpoints.push(route);
		return route;
	}

	staticEndpoint(rgx, root)
	{
		const route = new StaticEndpoint(rgx, root);
		this.endpoints.push(route);
		return route;
	}

	// Short hand endpoints

	GET(rgx, callback)
	{
		return this.endpoint("GET", rgx, callback);
	}

	POST(rgx, callback)
	{
		return this.endpoint("POST", rgx, callback);
	}

	PUT(rgx, callback)
	{
		return this.endpoint("PUT", rgx, callback);
	}

	DELETE(rgx, callback)
	{
		return this.endpoint("DELETE", rgx, callback);
	}

	HEAD(rgx, callback)
	{
		return this.endpoint("HEAD", rgx, callback);
	}

	OPTIONS(rgx, callback)
	{
		return this.endpoint("OPTIONS", rgx, callback);
	}

	static parseRequest(req)
	{
		const time = process.hrtime;
		const url = decodeURI(req.url);
		const method = req.method;
		let i;
		let query;
		let path;
		let filename;
		let ext;
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
			time: time,
			ext: ext,
			filename: filename,
			method: method,
			request: req,
			error: "",
			parameters: {}
		};
	}

	static getBody(req, sizeLimit)
	{
		return new Promise((res, rej) =>
		{
			let body = '';
			sizeLimit = sizeLimit || 1e6; // default limit is ~ 1MB
			req.on('data', function (data)
			{
				body += data;
				if (body.length > sizeLimit)
				{ // bad request, bail!
					req.connection.destroy();
					body = null;
					rej("Body exceeded size limit");
				}
			});
			req.on('end', function ()
			{
				res(body);
			});
			req.on('error', function (err)
			{
				rej(err);
			});
		});
	}

}

module.exports = PowerNap;