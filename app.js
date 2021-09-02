const fastify = require("fastify");
const { getErrorHandler } = require("./plugins/errorHandler");
const { authenticationRoutes } = require("./routes/authentication");

const build = (optns = {}) => {
	const app = fastify(optns);

	app.setErrorHandler(getErrorHandler(app));

	app.register(authenticationRoutes, { prefix: "api/v1/auth" });

	return app;
};

module.exports = {
	build,
};
