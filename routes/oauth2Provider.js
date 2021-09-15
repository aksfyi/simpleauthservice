const oauthPlugin = require("fastify-oauth2");
const { configs } = require("../configs");
const { githubLogin, githubCallback } = require("../handlers/oauth2Provider");
const { oauthSchema } = require("./schemas/oauth2ProviderSchema");

const oauth2Routes = (fastify, _, done) => {
	if (configs.GITHUB_CONFIGURED) {
		fastify.register(oauthPlugin, {
			name: "githubOauth2",
			// Should be enabled under github app settings
			scope: "user:email",
			credentials: {
				client: {
					id: configs.GITHUB_CLIENT_ID,
					secret: configs.GITHUB_CLIENT_SECRET,
				},
				auth: oauthPlugin.GITHUB_CONFIGURATION,
			},
			schema: oauthSchema.common,
			startRedirectPath: "/github",
			callbackUri: `${configs.AUTH_SERVICE_HOST}/api/v1/oauth/callback/github`,
		});

		fastify.route({
			method: "GET",
			url: "/callback/github",
			handler: githubCallback(fastify),
			schema: oauthSchema.frontendRedirection,
		});

		fastify.route({
			method: "POST",
			schema: oauthSchema.signin,
			url: "/github/signin",
			handler: githubLogin,
		});
	}

	done();
};

module.exports = {
	oauth2Routes,
};
