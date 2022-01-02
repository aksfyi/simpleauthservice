const mongoose = require("mongoose");

const jobsSchema = new mongoose.Schema({
	jobName: String,

	// Database entry
	jobCreatedAt: {
		type: Date,
		default: Date.now,
	},
	success: {
		type: Boolean,
		default: false,
	},

	// If there is an error
	errorDescription: {
		type: String,
	},

	// can be used for analytics Jobs
	// If a job uses a window for querying
	// For example : Number of active users b/w startDate and endDate
	startDate: Date,
	endDate: Date,
});

module.exports = {
	Jobs: mongoose.model("Jobs", jobsSchema),
};
