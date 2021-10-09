const { authJobsInit } = require("./authJobs");
const { statsJobsInit } = require("./statsJobs");

const jobsInit = (fastify) => {
	fastify.log.info("Starting Cron Jobs");
	authJobsInit(fastify);
	statsJobsInit(fastify);
};

module.exports = jobsInit;
