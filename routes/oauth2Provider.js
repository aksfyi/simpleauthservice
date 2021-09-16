const oauthPlugin = require("fastify-oauth2");
const { configs } = require("../configs");
const { githubLogin, githubCallback } = require("../handlers/oauth2Provider");
const { oauthSchema } = require("./schemas/oauth2ProviderSchema");

const oauth2Routes = (fastify, _, done) => {
	done();
};

module.exports = {
	oauth2Routes,
};
