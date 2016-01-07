var MIME_TYPES = {
	htm: 'text/html',
	html: 'text/html',
	js: 'application/javascript',
	json: 'application/json',
	jpg: 'image/jpeg',
	jpeg: 'image/jpeg',
	png: 'image/png',
	css: 'text/css',
	ico: 'image/x-icon',
	default: 'text/plain'
};

module.exports = function (ext) {
	return MIME_TYPES[ext] ? MIME_TYPES[ext] : MIME_TYPES['default'];
};