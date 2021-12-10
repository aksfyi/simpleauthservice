const {
	getOauthProviderLogin,
	postOauthProviderLogin,
} = require("../handlers/oauth2ProviderHandler");
const oauthCheck = require("../plugins/oauthCheck");
const { oauthSchema } = require("./schemas/oauth2ProviderSchema");

const oauth2Routes = async (fastify, opts) => {
	fastify.route({
		method: "GET",
		url: "/:provider",
		schema: oauthSchema.getOauthProviderLogin,
		preHandler: oauthCheck,
		handler: getOauthProviderLogin,
	});

	fastify.route({
		method: "POST",
		url: "/:provider",
		schema: oauthSchema.postOauthProviderLogin,
		preHandler: oauthCheck,
		handler: postOauthProviderLogin,
	});
};

module.exports = {
	oauth2Routes,
};
