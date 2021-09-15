const { configs } = require("../../configs");
const { getSuccessObject, responseErrors } = require("./common");

const oauthSchema = {
	common: {
		description:
			"URL to handle sign in using oauth2 provider.\
            Redirects to the provider url with the required\
            query parameters",
		tags: ["Oauth Provider Login"],
	},
	signin: {
		description:
			"Sign in using Oauth2 provider (callback URL handlers\
            redirection to frontend)",
		tags: ["Oauth Provider Login"],
		body: {
			type: "object",
			properties: {
				token: {
					type: "string",
					example: "asdfihasikdfjhisfuhkjdfn",
				},
			},
			required: ["token"],
		},
		response: {
			200: getSuccessObject(200, true, "Successful Sign in", {
				token: { type: "string" },
				refreshToken: { type: "string" },
			}),
			201: getSuccessObject(201, true, "Account successfully created", {
				token: { type: "string" },
				refreshToken: { type: "string" },
			}),
			400: responseErrors[400],
			500: responseErrors[500],
			404: responseErrors[404],
		},
	},
	frontendRedirection: {
		description: "Redirects to frontend from Oauth2 provider callback URL",
		tags: ["Oauth Provider Login"],
		response: {
			302: {
				type: "object",
				description: `Redirects to OAUTH_PROVIDER frontend url (Given in configuration)\
                 .Success response will have success:true\
				and token value added as query parameters.\
				Failure value will have success:false error & message`,
			},
		},
	},
};

module.exports = {
	oauthSchema,
};
