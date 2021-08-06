const bcrypt = require("bcrypt");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bouncer = require("../middleware/bouncer");
const crypto = require("crypto");
// const cryptoJS = require("crypto-js");

exports.signup = (req, res, next) => {
	var cryptedEmail = crypto
		.createHash("md5")
		.update(req.body.email)
		.digest("hex");
	bcrypt
		.hash(req.body.password, 10)
		.then((hash) => {
			const user = new User({
				email: cryptedEmail,
				password: hash,
			});
			user
				.save()
				.then(() => res.status(201).json({ message: "Utilisateur créé !" }))
				.catch((error) => res.status(400).json({ error }));
		})
		.catch((error) => res.status(500).json({ error }));
};

exports.login = (req, res, next) => {
	var cryptedEmail = crypto
		.createHash("md5")
		.update(req.body.email)
		.digest("hex");
	User.findOne({ email: cryptedEmail })
		.then((user) => {
			if (!user) {
				return res.status(401).json({ error: "Utilisateur non trouvé !" });
			}
			bcrypt
				.compare(req.body.password, user.password)
				.then((valid) => {
					if (!valid) {
						return res.status(401).json({ error: "Mot de passe incorrect !" });
					}
					bouncer.reset(req);
					res.status(200).json({
						userId: user._id,
						token: jwt.sign({ userId: user._id }, process.env.TOKEN_KEY, {
							expiresIn: "1h",
						}),
					});
				})
				.catch((error) => res.status(500).json({ error }));
		})
		.catch((error) => res.status(500).json({ error }));
};
