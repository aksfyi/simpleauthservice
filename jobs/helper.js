const { Jobs } = require("../models/jobs");

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
	DELETE_DEACTIVATED_USERS: {
		// Runs at 00:00
		expression: "0 0 * * *",
		jobName: "DELETE_DEACTIVATED_USERS",
	},
};

/**
 * Function called by the job which is passed to `cron.schedule` function
 * execute job runs the function which is passed. Its used to save the
 * success/failure states of the job to the database.
 *
 * @param {String} jobName Name of the job
 * @param fastify
 * @param {Function} job function to be executed
 * @param {Object} opts startDate and endDate
 */
const executeJob = async (jobName, fastify, job, opts) => {
	try {
		await job();

		await Jobs.create({
			jobName: jobName,
			success: true,
			startDate: opts ? opts.startDate : undefined,
			endDate: opts ? opts.endDate : undefined,
		});
	} catch (error) {
		fastify.log.error(error.message);
		await Jobs.create({
			jobName: jobName,
			success: false,
			errorDescription: error.message,
			startDate: opts ? opts.startDate : undefined,
			endDate: opts ? opts.endDate : undefined,
		});
	}
};

module.exports = {
	executeJob,
	cronExpressions,
};
