const { sendErrorResponse } = require("../handlers/responseHelpers");
const User = require("../models/user");
const { configs } = require("../configs");

/**
 * This should be used only after the JWT tokens are verified
 * Can be in the array of preHandlers after verifyAuth
 */
const checkDeactivated = (request, reply, done) => {
	if (request.user.isDeactivated) {
		sendErrorResponse(reply, 400, "User account is deactivated");
	}
	done();
};

const checkEmailConfirmed = (request, reply, done) => {
	if (!request.user.isEmailConfirmed) {
		sendErrorResponse(
			reply,
			400,
			"Please confirm the your email by clicking on the link in your email address"
		);
	}
	done();
};

const attachUser = (isDeactivated, isEmailConfirmed) => {
	return async (request, reply) => {
		const user = await User.findOne({
			email: request.user.email,
			isDeactivated: isDeactivated,
			isEmailConfirmed: isEmailConfirmed,
		});
		must(reply, user, "User not found");
		request.userModel = user;
	};
};

const attachUserWithPassword = (isDeactivated, isEmailConfirmed) => {
	return async (request, reply) => {
		const user = await User.findOne({
			email: request.user.email,
			isDeactivated: isDeactivated,
			isEmailConfirmed: isEmailConfirmed,
		}).select("+password");
		must(reply, user, "User not found");
		request.userModel = user;
	};
};

const checkPasswordLength = async (request, reply) => {
	const password = request.body.password;
	if (password.length < 8) {
		sendErrorResponse(reply, 400, "Minimum password length should be 8");
	}
};

const checkMailingDisabled = async (request, reply) => {
	if (configs.DISABLE_MAIL) {
		sendErrorResponse(reply, 500, "Mailing is disabled in the server");
	}
	if (!configs.IS_SMTP_CONFIGURED) {
		sendErrorResponse(reply, 500, "Mailing is not configured in the server");
	}
};

const refreshTokenValidation = async (request, reply) => {
	const refreshTokenCookie = request.cookies.refreshToken;
	if (!refreshTokenCookie) {
		sendErrorResponse(reply, 400, "Missing refresh token in cookie");
	}

	// Fastify-cookie has a function which can be used to sign & unsign tokens
	// unsignCookie returns valid, renew & false
	// valid (boolean) : the cookie has been unsigned successfully
	// renew (boolean) : the cookie has been unsigned with an old secret
	// value (string/null) : if the cookie is valid then returns string else null
	let refreshToken = request.unsignCookie(refreshTokenCookie);

	if (!refreshToken.valid) {
		sendErrorResponse(reply, 400, "Invalid Refresh Token", {
			clearCookie: true,
		});
	} else {
		request.refreshToken = refreshToken.value;
	}
};

const must = (reply, parameter, message) => {
	if (!parameter) {
		sendErrorResponse(reply, 400, message);
	}
};

module.exports = {
	checkDeactivated,
	checkEmailConfirmed,
	attachUser,
	attachUserWithPassword,
	checkPasswordLength,
	checkMailingDisabled,
	refreshTokenValidation,
};
