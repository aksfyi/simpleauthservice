const { configs } = require("../configs");

const getSwaggerOptions = () => {
	SWAGGER_OPTIONS = {
		swagger: {
			info: {
				title: "Test swagger",
				description: "testing the fastify swagger api",
				version: "0.1.0",
			},
			securityDefinitions: {
				apiKey: {
					type: "apiKey",
					name: "apiKey",
					in: "header",
				},
			},
			host: `localhost:${configs.PORT}`,
			schemes: ["http"],
			consumes: ["application/json"],
			produces: ["application/json"],
		},
		hideUntagged: true,
		exposeRoute: true,
	};
	return SWAGGER_OPTIONS;
};

module.exports = {
	getSwaggerOptions,
};
