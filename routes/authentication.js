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
	getProfile,
} = require("../handlers/authenticationHandler");
const { verifyAuth } = require("../plugins/authVerify");
const {
	checkDeactivated,
	checkEmailConfirmed,
	attachUser,
	attachUserWithPassword,
	checkPasswordLength,
	checkMailingDisabled,
} = require("../plugins/authHelperPlugins");
const { tokenCheck } = require("../plugins/tokenCheck");
const { authenticationSchema } = require("./schemas/authSchema");

const authenticationRoutes = (fastify, _, done) => {
	// signup and sign in routes
	fastify.route({
		method: "POST",
		url: "/signup",
		schema: authenticationSchema.signup,
		handler: registerUser,
	});

	fastify.route({
		method: "POST",
		url: "/signin",
		schema: authenticationSchema.signin,
		handler: signin,
	});

	// Route to redirect user to the frontend
	fastify.route({
		method: "GET",
		url: "/confirmEmail",
		preHandler: tokenCheck("confirmEmail"),
		schema: authenticationSchema.confirmEmailGet,
		handler: confirmEmailTokenRedirect,
	});

	// Route to request confirmation email when the user is logged in
	fastify.route({
		method: "POST",
		url: "/confirmEmail",
		schema: authenticationSchema.confirmEmailPost,
		preHandler: [
			verifyAuth(["admin", "user"], false),
			checkMailingDisabled,
			checkDeactivated,
			attachUser(false, false),
		],
		handler: requestConfirmationEmail,
	});

	// Route to confirm the email address by sending token
	fastify.route({
		method: "PUT",
		url: "/confirmEmail",
		preHandler: tokenCheck("confirmEmail"),
		schema: authenticationSchema.confirmEmailPut,
		handler: confirmEmail,
	});

	// Route to check reset password token and redirect to frontend
	fastify.route({
		method: "GET",
		url: "/resetPassword",
		preHandler: tokenCheck("password"),
		schema: authenticationSchema.resetPasswordGet,
		handler: resetPasswordTokenRedirect,
	});

	// Request for reset password token
	fastify.route({
		method: "POST",
		url: "/resetPassword",
		schema: authenticationSchema.resetPasswordPost,
		preHandler: checkMailingDisabled,
		handler: requestResetPasswordToken,
	});

	// Route to reset password from token
	fastify.route({
		method: "PUT",
		url: "/resetPassword",
		schema: authenticationSchema.resetPasswordPut,
		preHandler: [tokenCheck("password"), checkPasswordLength],
		handler: resetPasswordFromToken,
	});

	// Route to get profile information
	fastify.route({
		method: "GET",
		url: "/profile",
		preHandler: [verifyAuth(["admin", "user"], false), checkDeactivated],
		schema: authenticationSchema.profile,
		handler: getProfile,
	});

	// Route to update the password when the user is logged in
	fastify.route({
		method: "PUT",
		url: "/updatePassword",
		preHandler: [
			verifyAuth(["admin", "user"], false),
			checkDeactivated,
			checkEmailConfirmed,
			attachUserWithPassword(false, true),
			checkPasswordLength,
		],
		schema: authenticationSchema.updatePassword,
		handler: updatePassword,
	});

	// Route to get new JWT & refresh token
	fastify.route({
		method: "POST",
		url: "/refresh",
		schema: authenticationSchema.refreshJWTToken,
		handler: getJWTFromRefresh,
	});

	// Route to revoke refresh token
	fastify.route({
		method: "PUT",
		url: "/revoke",
		schema: authenticationSchema.revokeRefreshToken,
		preHandler: [verifyAuth(["admin", "user"], false), checkDeactivated],
		handler: revokeRefreshToken,
	});

	// Route to revoke all refresh tokens
	fastify.route({
		method: "PUT",
		url: "/revokeAll",
		schema: authenticationSchema.revokeAll,
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
