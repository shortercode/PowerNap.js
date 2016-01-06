var powernap = require('./powernap.js').powernap;

var app = new powernap(8080);
app.endpoint("get", "/Tests", function (req, res) {
	res.end("You smell");
});
app.staticEndpoint("/", ".");