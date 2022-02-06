const fastify = require("fastify")({ logger: true });
const { configs, keywords } = require("./configs");
const jobsInit = require("./jobs/init");
const { connectDB } = require("./models/connectDB");
const { getErrorHandler } = require("./plugins/errorHandler");
const { authenticationRoutes } = require("./routes/authentication");
const { oauth2Routes } = require("./routes/oauth2Provider");
const { getSwaggerOptions } = require("./utils/utils");
const helmet = require("fastify-helmet");
const { adminRoutes } = require("./routes/admin");
const { sendSuccessResponse } = require("./utils/responseHelpers");
const { getRefreshTokenOptns } = require("./models/refreshToken");
const fastifyCsrf = require("fastify-csrf");
const fastifyCookie = require("fastify-cookie");

// fastify-helmet adds various HTTP headers for security
if (!configs.ENVIRONMENT === keywords.DEVELOPMENT_ENV) {
	// https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP
	fastify.register(helmet, { contentSecurityPolicy: false });
}

if (configs.COOKIE_SECRET) {
	fastify.register(fastifyCookie, {
		secret: configs.COOKIE_SECRET, // For signing cookies
	});
	fastify.register(fastifyCsrf, getRefreshTokenOptns());
}

// Enable swagger ui in development environment
if (configs.ENVIRONMENT.toLowerCase() === keywords.DEVELOPMENT_ENV) {
	fastify.register(require("fastify-swagger"), getSwaggerOptions());
}

// If cors is enabled then register CORS origin
if (configs.ALLOW_CORS_ORIGIN) {
	fastify.register(require("fastify-cors"), {
		origin: configs.ALLOW_CORS_ORIGIN.split(","),
		credentials: true,
	});
}

// Use real IP address if x-real-ip header is present
fastify.addHook("onRequest", async (request, reply) => {
	request.ipAddress =
		request.headers["x-real-ip"] || // nginx
		request.headers["x-client-ip"] || // apache
		request.ip;
});

// Rate limits based on IP address
fastify.register(require("fastify-rate-limit"), {
	max: 100,
	timeWindow: "1 minute",
	keyGenerator: function (req) {
		return (
			req.headers["x-real-ip"] || // nginx
			req.headers["x-client-ip"] || // apache
			req.ip // fallback to default
		);
	},
});

// Set error Handler
fastify.setErrorHandler(getErrorHandler(fastify));

// Register Routes required for authentication
fastify.register(authenticationRoutes, { prefix: "api/v1/auth" });

// Register oauth2 routes
fastify.register(oauth2Routes, { prefix: "api/v1/auth/oauth" });

// Register admin routes
fastify.register(adminRoutes, { prefix: "api/v1/admin" });

// Auth Service health check
fastify.get("/", async (request, reply) => {
	sendSuccessResponse(reply, {
		statusCode: 200,
		message: "Application is running",
	});
});

// Start the server
const start = async () => {
	try {
		if (
			configs.JWT_KEY &&
			configs.MONGO_URI &&
			configs.COOKIE_SECRET &&
			configs.REFRESH_KEY
		) {
			// Connect to MongoDB Database
			connectDB(fastify);
			await fastify.listen(configs.PORT, configs.HOST);
			if (configs.ENVIRONMENT.toLowerCase() === keywords.DEVELOPMENT_ENV) {
				fastify.swagger();
			}

			// Start Cron Jobs
			jobsInit(fastify);
		} else {
			fastify.log.error("Please configure the required environment variables");
		}
	} catch (err) {
		fastify.log.error(err);
		process.exit(1);
	}
};
start();
