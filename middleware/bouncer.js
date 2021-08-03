var bouncer = require("express-bouncer")(600000, 600000, 3);
module.exports = bouncer;

bouncer.blocked = function (req, res, next, remaining) {
	res.send(
		429,
		"Too many requests have been made, " +
			"please wait " +
			remaining / 1000 +
			" seconds"
	);
};

bouncer.addresses = {};
