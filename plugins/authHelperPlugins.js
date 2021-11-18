const { sendErrorResponse } = require("../handlers/responseHelpers");
const User = require("../models/user");
const { configs } = require("../configs");
const { default: axios } = require("axios");

/**
 * This should be used only after the JWT tokens are verified
 * Can be in the array of preHandlers after verifyAuth
 */
const checkDeactivated = async (request, reply) => {
	request.log.info("Checking if the user account is deactivated");
	const user = request.user || request.userModel;
	if (user.isDeactivated) {
		return sendErrorResponse(reply, 400, "User account is deactivated");
	}
};

/**
 * This should be used only after the JWT tokens are verified
 * Can be in the array of preHandlers after verifyAuth
 */
const checkEmailConfirmed = async (request, reply) => {
	request.log.info("Checking if the user email is confirmed");
	const user = request.user || request.userModel;
	if (!user.isEmailConfirmed) {
		return sendErrorResponse(
			reply,
			400,
			"Please confirm the your email by clicking on the link sent to your email address"
		);
	}
};

/**
 * Attaches user to request object (request.userModel)
 * @param {Boolean} byEmail true if email is being sent in request body.
 * 	false if the route is protected (uses uid from the jwt token)
 * @returns
 */
const attachUser = (byEmail) => {
	return async (request, reply) => {
		request.log.info(
			`Attaching user by ${byEmail ? "email" : "user id in the token"}`
		);
		if (!byEmail) {
			user = await User.findOne({
				uid: request.user.uid,
			});
		} else {
			user = await User.findOne({
				email: request.body.email,
			});
		}
		must(reply, user, "User not found");
		request.userModel = user;
	};
};

/**
 * Attaches user (with password) to request object (request.userModel)
 * @param {Boolean} byEmail true if email is being sent in request body.
 * 	false if the route is protected (uses uid from the jwt token)
 * @returns
 */
const attachUserWithPassword = (byEmail) => {
	return async (request, reply) => {
		request.log.info(
			`Attaching user with password by ${
				byEmail ? "email" : " user id in the token"
			}`
		);
		let user;
		if (!byEmail) {
			user = await User.findOne({
				uid: request.user.uid,
			}).select("+password");
		} else {
			user = await User.findOne({
				email: request.body.email,
			}).select("+password");
		}
		must(reply, user, "User not found");
		request.userModel = user;
	};
};

const checkPasswordLength = async (request, reply) => {
	request.log.info("Checking password length");
	const password = request.body.password;
	if (password.length < 8) {
		return sendErrorResponse(reply, 400, "Minimum password length should be 8");
	}
};

const checkMailingDisabled = async (request, reply) => {
	request.log.info("Checking if mailing is disabled in the server");
	if (configs.DISABLE_MAIL) {
		return sendErrorResponse(reply, 500, "Mailing is disabled in the server");
	}
	if (!configs.IS_SMTP_CONFIGURED) {
		return sendErrorResponse(
			reply,
			500,
			"Mailing is not configured in the server"
		);
	}
};

/**
 *
 * Checks if the request token is valid
 * @returns
 */
const refreshTokenValidation = async (request, reply) => {
	request.log.info("Validating refresh token");
	// If refresh token is sent in request body attach it to request object
	// (request.refreshToken) else check cookie and validate the token in the cookie
	// then attach it to request body (request.refreshToken) if the cookie is
	// valid
	let refreshTokenBody = request.body ? request.body.refreshToken : false;
	if (!refreshTokenBody) {
		const refreshTokenCookie = request.cookies.refreshToken;
		if (!refreshTokenCookie) {
			return sendErrorResponse(reply, 400, "Missing refresh token in cookie");
		}
		// Fastify-cookie has a function which can be used to sign & unsign tokens
		// unsignCookie returns valid, renew & false
		// valid (boolean) : the cookie has been unsigned successfully
		// renew (boolean) : the cookie has been unsigned with an old secret
		// value (string/null) : if the cookie is valid then returns string else null
		let refreshToken = request.unsignCookie(refreshTokenCookie);

		if (!refreshToken.valid) {
			return sendErrorResponse(reply, 400, "Invalid Refresh Token", {
				clearCookie: true,
			});
		} else {
			request.refreshToken = refreshToken.value;
		}
	} else {
		request.refreshToken = refreshTokenBody;
	}
};

/**
 *
 * Function used to verify hcaptcha token
 * @returns
 */
const hCaptchaVerification = async (request, reply) => {
	request.log.info("Verifying hcaptcha token");
	if (!configs.DISABLE_CAPTCHA) {
		if (!configs.HCAPTCHA_SECRET) {
			return sendErrorResponse(
				reply,
				500,
				"Robot verification not configured in the server (hCaptcha)"
			);
		}
		const hToken = request.body.hToken;
		must(reply, hToken, "Robot verification token missing");
		const tokenVerify = await axios({
			method: "POST",
			url: configs.HCAPTCHA_VERIFY_URL,
			headers: { "Content-Type": "application/x-www-form-urlencoded" },
			data: `response=${encodeURIComponent(hToken)}&secret=${encodeURIComponent(
				configs.HCAPTCHA_SECRET
			)}`,
		});
		if (!tokenVerify.data.success) {
			return sendErrorResponse(reply, 400, "Robot verification unsuccessful");
		}
	}
};

const must = (reply, parameter, message) => {
	if (!parameter) {
		return sendErrorResponse(reply, 400, message);
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
	hCaptchaVerification,
};
