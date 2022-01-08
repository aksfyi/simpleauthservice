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
	getAccount,
	deleteAccount,
} = require("../handlers/authenticationHandler");
const { verifyAuth } = require("../plugins/authVerify");
const {
	checkDeactivated,
	checkEmailConfirmed,
	attachUser,
	attachUserWithPassword,
	checkPasswordLength,
	checkMailingDisabled,
	hCaptchaVerification,
} = require("../plugins/authHelperPlugins");
const { tokenCheck } = require("../plugins/tokenCheck");
const { authenticationSchema } = require("./schemas/authSchema");
const { configs } = require("../configs");
const { verifyRefresh } = require("../plugins/refreshVerify");

const authenticationRoutes = async (fastify, opts) => {
	if (!configs.DISABLE_EMAIL_LOGIN) {
		// signup and sign in routes
		fastify.route({
			method: "POST",
			url: "/signup",
			schema: authenticationSchema.signup,
			preHandler: [hCaptchaVerification],
			handler: registerUser,
		});

		fastify.route({
			method: "POST",
			url: "/signin",
			preHandler: [
				hCaptchaVerification,
				attachUserWithPassword(true),
				checkDeactivated,
				checkEmailConfirmed,
			],
			schema: authenticationSchema.signin,
			handler: signin,
		});

		// Route to check reset password token and redirect to frontend
		fastify.route({
			method: "GET",
			url: "/resetPassword",
			preHandler: [tokenCheck("password", true)],
			schema: authenticationSchema.resetPasswordGet,
			handler: resetPasswordTokenRedirect,
		});

		// Request for reset password token
		fastify.route({
			method: "POST",
			url: "/resetPassword",
			schema: authenticationSchema.resetPasswordPost,
			preHandler: [
				hCaptchaVerification,
				checkMailingDisabled,
				attachUser(true),
				checkDeactivated,
			],
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

		// Route to update the password when the user is logged in
		fastify.route({
			method: "PUT",
			url: "/updatePassword",
			preHandler: [
				verifyAuth(["admin", "user"]),
				checkDeactivated,
				checkEmailConfirmed,
				attachUserWithPassword(false),
				checkPasswordLength,
			],
			schema: authenticationSchema.updatePassword,
			handler: updatePassword,
		});
	}

	// Route to redirect user to the frontend
	fastify.route({
		method: "GET",
		url: "/confirmEmail",
		preHandler: tokenCheck("confirmEmail", true),
		schema: authenticationSchema.confirmEmailGet,
		handler: confirmEmailTokenRedirect,
	});

	// Route to request to resend confirmation email
	fastify.route({
		method: "POST",
		url: "/confirmEmail",
		schema: authenticationSchema.confirmEmailPost,
		preHandler: [
			hCaptchaVerification,
			checkMailingDisabled,
			attachUser(true),
			checkDeactivated,
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

	// Route to get account information
	fastify.route({
		method: "GET",
		url: "/account",
		preHandler: [
			verifyAuth(["admin", "user"]),
			attachUser(false),
			checkEmailConfirmed,
			checkDeactivated,
		],
		schema: authenticationSchema.getAccount,
		handler: getAccount,
	});

	// Route to delete account
	fastify.route({
		method: "DELETE",
		url: "/account",
		preHandler: [
			verifyAuth(["admin", "user"]),
			checkDeactivated,
			checkEmailConfirmed,
			attachUserWithPassword(false),
		],
		schema: authenticationSchema.deleteAccount,
		handler: deleteAccount,
	});

	// Route to get new JWT & refresh token
	fastify.route({
		method: "POST",
		url: "/refresh",
		schema: authenticationSchema.refreshJWTToken,
		preHandler: verifyRefresh,
		handler: getJWTFromRefresh,
	});

	fastify.route({
		method: "PUT",
		url: "/refresh/revoke",
		schema: authenticationSchema.revokeRefreshToken,
		preHandler: [
			verifyAuth(["admin", "user"]),
			checkDeactivated,
			verifyRefresh,
		],
		handler: revokeRefreshToken,
	});

	// Route to revoke all refresh tokens
	fastify.route({
		method: "PUT",
		url: "/revokeAll",
		schema: authenticationSchema.revokeAll,
		preHandler: [
			verifyAuth(["admin", "user"]),
			checkDeactivated,
			attachUser(false),
		],
		handler: revokeAllRefreshTokens,
	});
};

module.exports = {
	authenticationRoutes,
};
