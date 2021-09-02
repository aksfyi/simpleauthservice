const {
	registerUser,
	confirmEmail,
	requestResetPasswordToken,
	requestConfirmationEmail,
	resetPasswordTokenRedirect,
	resetPasswordFromToken,
	updatePassword,
	confirmEmailTokenRedirect,
	signin,
	getJWTFromRefresh,
	revokeRefreshToken,
	revokeAllRefreshTokens,
} = require("../handlers/authentication");
const { verifyAuth } = require("../plugins/authVerify");
const {
	checkDeactivated,
	checkEmailConfirmed,
	attachUser,
	attachUserWithPassword,
} = require("../plugins/authHelperPlugins");
const { tokenCheck } = require("../plugins/tokenCheck");
const { authSchema } = require("./schema");

const authenticationRoutes = (fastify, _, done) => {
	// signup and sign in routes
	fastify.route({
		method: "POST",
		url: "/signup",
		schema: {
			body: authSchema.signup,
		},
		handler: registerUser,
	});

	fastify.route({
		method: "POST",
		url: "/signin",
		schema: {
			body: authSchema.signin,
		},
		handler: signin,
	});

	// Email confirmation routes
	fastify.route({
		method: "GET",
		url: "/confirmEmail",
		preHandler: tokenCheck("confirmEmail"),
		schema: {
			queryString: authSchema.tokenCheck,
		},
		handler: confirmEmailTokenRedirect,
	});

	fastify.route({
		method: "PUT",
		url: "/confirmEmail",
		preHandler: tokenCheck("confirmEmail"),
		schema: {
			body: authSchema.tokenCheck,
		},
		handler: confirmEmail,
	});

	fastify.route({
		method: "POST",
		url: "/confirmEmail",
		preHandler: [
			verifyAuth(["admin", "user"], false),
			checkDeactivated,
			attachUser(false, false),
		],
		handler: requestConfirmationEmail,
	});

	// Reset Password from Token routes
	fastify.route({
		method: "POST",
		url: "/resetPassword",
		schema: {
			body: authSchema.resetPasswordRequestToken,
		},
		handler: requestResetPasswordToken,
	});

	fastify.route({
		method: "GET",
		url: "/resetPassword",
		preHandler: tokenCheck("password"),
		schema: {
			queryString: authSchema.tokenCheck,
		},
		handler: resetPasswordTokenRedirect,
	});

	fastify.route({
		method: "PUT",
		url: "/resetPassword",
		schema: {
			body: authSchema.resetPasswordFromToken,
		},
		preHandler: tokenCheck("password"),
		handler: resetPasswordFromToken,
	});

	fastify.route({
		method: "PUT",
		url: "/updatePassword",
		preHandler: [
			verifyAuth(["admin", "user"], false),
			checkDeactivated,
			checkEmailConfirmed,
			attachUserWithPassword(false, true),
		],
		schema: {
			body: authSchema.updatePassword,
		},
		handler: updatePassword,
	});

	fastify.route({
		method: "POST",
		url: "/refresh",
		schema: {
			body: authSchema.refreshTokenCheck,
		},
		handler: getJWTFromRefresh,
	});

	fastify.route({
		method: "PUT",
		url: "/revoke",
		schema: {
			body: authSchema.refreshTokenCheck,
		},
		preHandler: [verifyAuth(["admin", "user"], false), checkDeactivated],
		handler: revokeRefreshToken,
	});

	fastify.route({
		method: "PUT",
		url: "/revokeAll",
		preHandler: [
			verifyAuth(["admin", "user"], false),
			checkDeactivated,
			attachUser(false, false),
		],
		handler: revokeAllRefreshTokens,
	});

	done();
};

module.exports = {
	authenticationRoutes,
};
