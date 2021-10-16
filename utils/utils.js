const { configs } = require("../configs");

const getSwaggerOptions = () => {
	SWAGGER_OPTIONS = {
		swagger: {
			info: {
				title: "simpleauth",
				description:
					"Simple Authentication Service API \nhttps://github.com/aksty/simpleauthservice",
				version: "0.1.0",
			},
			securityDefinitions: {
				JWTToken: {
					description: 'Authorization header token, sample: "Bearer {token}"',
					type: "apiKey",
					name: "Authorization",
					in: "header",
				},
			},
			//host: `localhost:${configs.PORT}`,
			schemes: ["http", "https"],
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
