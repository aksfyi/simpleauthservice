const { getConfigs } = require("../handlers/adminHandler");
const { verifyAuth } = require("../plugins/authVerify");
const { adminSchema } = require("./schemas/adminSchema");

const adminRoutes = async (fastify, opts) => {
	fastify.route({
		method: "GET",
		url: "/configs",
		schema: adminSchema.configsGet,
		preHandler: verifyAuth(["admin"], true),
		handler: getConfigs,
	});
};

module.exports = {
	adminRoutes,
};
