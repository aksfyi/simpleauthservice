const { getConfigs } = require("../handlers/adminHandler");
const { verifyAuth } = require("../plugins/authVerify");
const { adminSchema } = require("./schemas/adminSchema");

const adminRoutes = (fastify, _, done) => {
	fastify.route({
		method: "GET",
		url: "/configs",
		schema: adminSchema.configsGet,
		preHandler: verifyAuth(["admin"], true),
		handler: getConfigs,
	});

	done();
};

module.exports = {
	adminRoutes,
};
