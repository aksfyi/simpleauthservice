const cron = require("node-cron");
const { RefreshToken } = require("../models/refreshToken");
const { Stats } = require("../models/stats");
const { User } = require("../models/user");
const { executeJob, cronExpressions } = require("./helper");

const statsJobsInit = (fastify) => {
	cron.schedule(cronExpressions.USER_STATS.expression, async () => {
		fastify.log.info(`Running ${cronExpressions.USER_STATS.jobName}`);
		const endDate = Date.now();
		const startDate = endDate - 24 * 60 * 60 * 1000;

		await executeJob(
			cronExpressions.USER_STATS.jobName,
			fastify,
			async () => {
				const resultsTodayJoined = await User.find({
					createdAt: {
						$gte: startDate,
						$lte: endDate,
					},
				});

				const resultsActiveUsers = await RefreshToken.find({
					expiresAt: { $gte: Date.now() },
					isRevoked: false,
				}).distinct("user");

				const resultsActiveUsersToday = await RefreshToken.find({
					createdAt: {
						$gte: startDate,
						$lte: endDate,
					},
				}).distinct("user");

				let usersJoinedToday = resultsTodayJoined.length;
				let activeUsersToday = resultsActiveUsersToday.length;
				let activeUsersCount = resultsActiveUsers.length;
				await Stats.create({
					usersCount: await User.countDocuments(),
					usersJoinedToday,
					activeUsersToday,
					activeUsersCount,
				});
			},
			{ startDate, endDate }
		);
	});
};

module.exports = { statsJobsInit };
