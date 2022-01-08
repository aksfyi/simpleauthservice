const cron = require("node-cron");
const { RefreshToken } = require("../models/refreshToken");
const { User } = require("../models/user");
const { executeJob, cronExpressions } = require("./helper");

const authJobsInit = (fastify) => {
	// Delete revoked refresh tokens
	cron.schedule(cronExpressions.REFRESH_TOKEN_DELETE.expression, async () => {
		fastify.log.info(`Running ${cronExpressions.REFRESH_TOKEN_DELETE.jobName}`);
		await executeJob(
			cronExpressions.REFRESH_TOKEN_DELETE.jobName,
			fastify,
			async () => {
				// Delete Revoked Tokens
				await RefreshToken.deleteMany({
					isRevoked: true,
				});
				// Delete expired Tokens
				await RefreshToken.deleteMany({
					expiresAt: { $lte: Date.now() },
				});
			}
		);
	});

	// Cron Job to Delete deactivated user accounts
	// By default DELETE request does not delete the user record from
	// the database, instead it deactivates. Accounts deactivated 10 days
	// before current date (Date.now()) will be deleted.
	cron.schedule(
		cronExpressions.DELETE_DEACTIVATED_USERS.expression,
		async () => {
			fastify.log.info(
				`Running ${cronExpressions.DELETE_DEACTIVATED_USERS.jobName}`
			);
			await executeJob(
				cronExpressions.DELETE_DEACTIVATED_USERS.jobName,
				fastify,
				async () => {
					await User.deleteMany({
						isDeactivated: true,
						deactivatedAt: { $lte: Date.now() - 10 * 24 * 60 * 60 * 1000 },
					});
				}
			);
		}
	);
};

module.exports = {
	authJobsInit,
};
