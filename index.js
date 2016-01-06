const http = require('http');

const MIME = {
	
};

class powernap {
	
	constructor (port) {
		const endpoints = [],
		server = ;
			
	}
	
	_parseRequest (url) {
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
		i = filename.lastIndexOf(".", i);
		ext = ~i ? path.slice(i + 1) : "";
		return {
			query: query,
			path: path,
			ext: ext,
			filename: filename
		};
	}
	
	endpoint (method) {
	
	}
	
}

class endpoint {
	
	constructor (method, rgx) {
		
	}
	
}

class static