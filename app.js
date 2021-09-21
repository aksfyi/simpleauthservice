const fastify = require("fastify")({ logger: true });
const { configs, checkConfigs } = require("./configs");
const { sendSuccessResponse } = require("./handlers/responseHelpers");
const { connectDB } = require("./models/connectDB");
const { getErrorHandler } = require("./plugins/errorHandler");
const { authenticationRoutes } = require("./routes/authentication");
const { oauth2Routes } = require("./routes/oauth2Provider");
const { getSwaggerOptions } = require("./utils/utils");

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

// Register Routes required for authentication
fastify.register(authenticationRoutes, { prefix: "api/v1/auth" });

// Register oauth2 routes
fastify.register(oauth2Routes, { prefix: "api/v1/auth/oauth" });

// Auth Service health check
fastify.get("/", async (request, reply) => {
	sendSuccessResponse(reply, {
		statusCode: 200,
		message: "Application is running",
		...checkConfigs,
	});
});

// Start the server
const start = async () => {
	try {
		if (configs.JWT_KEY && configs.MONGO_URI) {
			// Connect to MongoDB Database
			connectDB(fastify);
			await fastify.listen(configs.PORT);
			if (configs.ENVIRONMENT.toLowerCase() === "dev") {
				fastify.swagger();
			}
		} else {
			fastify.log.error("Please configure the required environment variables");
		}
	} catch (err) {
		fastify.log.error(err);
		process.exit(1);
	}
};
start();
