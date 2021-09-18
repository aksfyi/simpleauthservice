const { configs } = require("../configs");
const { sendErrorResponse } = require("../handlers/responseHelpers");

const oauthCheck = (request, reply, done) => {
	const { provider } = request.params;

	switch (provider) {
		case configs.PROVIDER_GITHUB:
			if (!configs.GITHUB_CONFIGS.CONFIGURED) {
				sendErrorResponse(
					reply,
					500,
					"Please configure github configs in server"
				);
			}
			break;
		default:
			sendErrorResponse(
				reply,
				404,
				`Route ${request.method}:${request.url} not found`
			);
			break;
	}
	request.provider = provider;
	done();
};

module.exports = oauthCheck;
