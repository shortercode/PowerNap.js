var app = new (require('./PowerNap.js'))(8080);

app.endpoint("get", "/Tests", function (req, res) {
	res.end("You smell");
});

app.endpoint("get", "/hello/:world/test/:lemon", function (req, res) {
	res.end(JSON.stringify(req.parameters, null, 2));
});

app.staticEndpoint("/Public", "../");
