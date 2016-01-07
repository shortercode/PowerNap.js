var app = new (require('./PowerNap.js'))(8080);

app.endpoint("get", "/Tests", function (req, res) {
	res.end("You smell");
});

app.staticEndpoint("/", ".");