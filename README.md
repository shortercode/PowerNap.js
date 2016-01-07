# PowerNap.js

A simple and minimal framework for creating http servers with multiple REST style endpoints.

### How to install
```
npm install powernap.js
```
### Creating a server
```
var PowerNap = require('powernap.js');

var server = new PowerNap(8080);
```
### Adding endpoints to a server
```
server.endpoint("get", '/api', function (request, response) {
	response.end("Hello world");
});
```
### Adding a static endpoint to a server
```
server.staticEndpoint("/public", "./public");
```

# PowerNap.js Documentation

## class PowerNap (port)

 - `Integer port`

Creates a new http server at a given port with no bound endpoints.
```
var server = new PowerNap(80);
```
### method endpoint (method, regex, callback)

- `String method`
- `String/RegExp regex`
- `Function callback` 

Creates and attaches a new endpoint to the server with a given regular expression and method (e.g. "ALL" / "GET" / "POST" / "PUT" / "DELETE" / "HEAD").

Endpoints should be added in order from highest priority to lowest, as the first match will be the only one called.

Any value passed as the regex will be cast into a Regular Expression, this is the value used to match a request to an endpoint.

Callbacks will receive the following 2 arguments:
```
Object request {
	String	query		// query string
	String	path		// path
	String	ext			// file extension
	String	filename 	// filename
	String	method 		// http method
	Object	request 	// original request object
}

Object	response 		// original response object
```
#### Example
Create an endpoint at `/myRESTfulAPI` that returns the string `"hello world"`.
```
var server = new PowerNap(80);
server.endpoint('GET', '/myRESTfulAPI', function (request, response) {
	response.end("hello world");
});
```
### method staticEndpoint (regex, root)

 - `String/RegExp regex`
 - `String root`

Creates and attaches a new static endpoint to the server with a given regular expression and root directory.

By default requesting a directory will return a dynamically generated index page.

#### Example
Serve the contents of the `./public` directory at the `/` endpoint.
```
var server = new PowerNap(80);
server.staticEndpoint('/', './public');
```

### static method parseRequest (request)
 - `Object request`

Used internally to parse requests for url recognition logic, returns:
```
Object request {
	String	query		// query string
	String	path		// path
	String	ext			// file extension
	String	filename 	// filename
	String	method 		// http method
	Object	request 	// original request object
}
```
#### Example
```
var http = require('http');
http.createServer(function (request, reponse) {
    var req = PowerNap.parseRequest(request);
}).listen(80);
```
### static method getBody (request)
 - `Object request`

Utility method for getting the body of a request, returns a promise that resolves into the body. Body size is capped at 1MB.

#### Example
```
var server = new PowerNap(80);
server.endpoint('POST', '/uploadfile', function (request, response) {
    var body = PowerNap.getBody(request.request);
    body.then(function resolve(){
        // do something with body
        response.end("Success");
    }, function reject() {
        response.statusCode = 500;
        response.end("Failed");
    });
});
