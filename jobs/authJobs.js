const cron = require("node-cron");
const RefreshToken = require("../models/refreshToken");
const { executeJob, cronExpressions } = require("./helper");

const authJobsInit = (fastify) => {
	// Delete revoked refresh tokens
	cron.schedule(cronExpressions.REFRESH_TOKEN_DELETE.expression, async () => {
		fastify.log.info(`Running ${cronExpressions.REFRESH_TOKEN_DELETE.jobName}`);
		await executeJob(
			async () => {
				// Delete Revoked Tokens
				await RefreshToken.deleteMany({
					isRevoked: true,
				});
				// Delete expired Tokens
				await RefreshToken.deleteMany({
					expiresAt: { $lte: Date.now() },
				});
			},
			cronExpressions.REFRESH_TOKEN_DELETE.jobName,
			fastify
		);
	});
};

module.exports = {
	authJobsInit,
};
