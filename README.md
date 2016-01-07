# PowerNap

A simple and minimal framework for creating http servers with multiple endpoints.

## How to install
```
npm install powernap.js
```
## Creating a server @ port 8080
```
var PowerNap = require('powernap.js');

var server = new PowerNap(8080);
```
## Adding endpoints to a server
```
server.endpoint("get", '/api', function (request, response) {
	response.end("Hello world");
});
```
## Adding a static endpoint to a server
```
server.staticEndpoint("/public", "./public");
```
