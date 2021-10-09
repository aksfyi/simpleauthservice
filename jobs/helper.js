const Jobs = require("../models/jobs");

const cronExpressions = {
	REFRESH_TOKEN_DELETE: {
		// Runs at every 30th minute.
		expression: "*/30 * * * *",
		jobName: "REFRESH_TOKEN_DELETE",
	},
	USER_STATS: {
		// Runs at 00:00
		expression: "0 0 * * *",
		jobName: "USER_STATS",
	},
};

/**
 *
 * @param {Function} job function to be executed
 * @param {String} jobName Name of the job
 * @param fastify
 */
const executeJob = async (job, jobName, fastify, startDate, endDate) => {
	try {
		await job();

		await Jobs.create({
			jobName: jobName,
			success: true,
			startDate,
			endDate,
		});
	} catch (error) {
		fastify.log.error(error.message);
		await Jobs.create({
			jobName: jobName,
			success: false,
			errorDescription: error.message,
			startDate,
			endDate,
		});
	}
};

module.exports = {
	executeJob,
	cronExpressions,
};
