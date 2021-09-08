const fastify = require("fastify")({ logger: true });
const { configs } = require("./configs");
const { connectDB } = require("./models/connectDB");
const { getErrorHandler } = require("./plugins/errorHandler");
const { authenticationRoutes } = require("./routes/authentication");
const { getSwaggerOptions } = require("./utils/utils");

// Connect to MongoDB Database
connectDB(fastify);

// Enable swagger ui in development environment
if (configs.ENVIRONMENT.toLowerCase() === "dev") {
	fastify.register(require("fastify-swagger"), getSwaggerOptions());
}

// If cors is enabled then register CORS origin
if (configs.ALLOW_CORS_ORIGIN) {
	fastify.register(require("fastify-cors"), {
		origin: configs.ALLOW_CORS_ORIGIN,
	});
}

// Set error Handler
fastify.setErrorHandler(getErrorHandler(fastify));

//	Register Routes required for authentication
fastify.register(authenticationRoutes, { prefix: "api/v1/auth" });

// Start the server
const start = async () => {
	try {
		await fastify.listen(configs.PORT);
		if (configs.ENVIRONMENT.toLowerCase() === "dev") {
			fastify.swagger();
		}
	} catch (err) {
		fastify.log.error(err);
		process.exit(1);
	}
};
start();
