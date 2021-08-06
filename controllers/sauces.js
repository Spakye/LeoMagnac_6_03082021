const jwt = require("jsonwebtoken");
const Sauce = require("../models/Sauces");
const fs = require("fs");

exports.getAllSauces = (req, res, next) => {
	Sauce.find()
		.then((sauces) => {
			res.status(200).json(sauces);
		})
		.catch((error) => {
			res.status(400).json({
				error: error,
			});
		});
};

exports.getOneSauce = (req, res, next) => {
	Sauce.findOne({
		_id: req.params.id,
	})
		.then((sauce) => {
			res.status(200).json(sauce);
		})
		.catch((error) => {
			res.status(404).json({
				error: error,
			});
		});
};

exports.addNewSauce = (req, res, next) => {
	const sauceObject = JSON.parse(req.body.sauce);
	delete sauceObject._id;
	const sauce = new Sauce({
		...sauceObject,
		imageUrl: `${req.protocol}://${req.get("host")}/images/${
			req.file.filename
		}`,
		likes: 0,
		dislikes: 0,
		usersLiked: JSON.stringify([]),
		usersDisliked: JSON.stringify([]),
	});
	sauce
		.save()
		.then(() => res.status(201).json({ message: "Sauce enregistrée !" }))
		.catch((error) => res.status(400).json({ error }));
};

exports.modifySauce = (req, res, next) => {
	const sauceObject = req.file
		? {
				...JSON.parse(req.body.sauce),
				imageUrl: `${req.protocol}://${req.get("host")}/images/${
					req.file.filename
				}`,
		  }
		: { ...req.body };
	if (req.file != undefined) {
		Sauce.findOne({ _id: req.params.id })
			.then((sauce) => {
				const filename = sauce.imageUrl.split("/images/")[1];
				if (filename != undefined) {
					fs.unlink(`images/${filename}`, (err) => {
						if (err) {
							console.log("was not deleted");
						} else {
							console.log("deleted");
						}
					});
				}
			})
			.catch((error) => console.log(error));
	}
	Sauce.updateOne(
		{ _id: req.params.id },
		{ ...sauceObject, _id: req.params.id }
	)
		.then(() => res.status(200).json({ message: "Sauce modifiée !" }))
		.catch((error) => res.status(500).json({ error }));
};

exports.deleteSauce = (req, res, next) => {
	Sauce.findOne({ _id: req.params.id })
		.then((sauce) => {
			const filename = sauce.imageUrl.split("/images/")[1];
			fs.unlink(`images/${filename}`, () => {
				Sauce.deleteOne({ _id: req.params.id })
					.then(() => res.status(200).json({ message: "Sauce supprimée !" }))
					.catch((error) => res.status(400).json({ error }));
			});
		})
		.catch((error) => res.status(500).json({ error }));
};

exports.likeSauce = (req, res, next) => {
	Sauce.findOne({ _id: req.params.id })
		.then((sauce) => {
			const userId = req.body.userId;
			const like = req.body.like;
			var likes = sauce.likes;
			var dislikes = sauce.dislikes;
			var usersLiked = JSON.parse(sauce.usersLiked);
			var usersDisliked = JSON.parse(sauce.usersDisliked);

			// Reset the like/dislikes
			var index = usersLiked.indexOf(userId);
			if (index != -1) {
				usersLiked.splice(index, 1);
				likes = likes - 1;
			}
			index = usersDisliked.indexOf(userId);
			if (index != -1) {
				usersDisliked.splice(index, 1);
				dislikes = dislikes - 1;
			}

			// the user liked the sauce
			if (like === 1) {
				likes = likes + 1;
				usersLiked.push(userId);
				// var index = usersDisliked.indexOf(userId);
				// if (index != -1) {
				// 	usersDisliked.splice(index, 1);
				// 	dislikes = dislikes - 1;
				// }
			}
			// the user cancel his like/dislike
			if (like === 0) {
				// var index = usersLiked.indexOf(userId);
				// if (index != -1) {
				// 	usersLiked.splice(index, 1);
				// 	likes = likes - 1;
				// }
				// index = usersDisliked.indexOf(userId);
				// if (index != -1) {
				// 	usersDisliked.splice(index, 1);
				// 	dislikes = dislikes - 1;
				// }
			}
			// the user disliked the sauce
			if (like === -1) {
				dislikes = dislikes + 1;
				usersDisliked.push(userId);
				// var index = usersLiked.indexOf(userId);
				// if (index != -1) {
				// 	usersLiked.splice(index, 1);
				// 	likes = likes - 1;
				// }
			}
			console.log("like: " + like);
			console.log("likes: " + likes);
			console.log("dislikes: " + dislikes);
			console.log("users likes: " + JSON.stringify(usersLiked));
			console.log("users dislikes: " + JSON.stringify(usersDisliked));
			Sauce.updateOne(
				{ _id: req.params.id },
				{
					likes: likes,
					dislikes: dislikes,
					usersLiked: JSON.stringify(usersLiked),
					usersDisliked: JSON.stringify(usersDisliked),
				}
			)
				.then(() => res.status(200).json({ message: "Success!" }))
				.catch((error) => res.status(500).json({ error }));
		})
		.catch((error) => res.status(404).json({ error }));
};
