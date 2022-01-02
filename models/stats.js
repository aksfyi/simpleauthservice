const mongoose = require("mongoose");

const statsSchema = new mongoose.Schema({
	usersCount: Number,
	// Number of users created in last 24 Hrs
	userJoinedToday: Number,
	activeUsersCount: Number,
	activeUsersToday: Number,
	createdAt: {
		type: Date,
		default: Date.now,
	},
	startDate: Date,
	endDate: Date,
});

module.exports = {
	Stats: mongoose.model("Stats", statsSchema),
};
