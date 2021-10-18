const { configs } = require("../configs");
const { getRefreshTokenOptns } = require("../utils/authhelpers");

const sendErrorResponse = (reply, statusCode, message, options = {}) => {
	let error = "Internal Server Error";
	switch (statusCode) {
		case 400:
			error = "Bad Request";
			break;
		case 404:
			error = "Not Found";
			break;
		case 403:
			error = "Forbidden";
			break;
		default:
			break;
	}
	if (!options.redirectURL) {
		if (options.clearCookie) {
			reply.clearCookie("refreshToken", getRefreshTokenOptns());
		}
		reply.status(statusCode).send({
			statusCode,
			error,
			message,
			success: false,
		});
	} else {
		reply
			.code(302)
			.redirect(
				`${options.redirectURL}?error=${error}&message=${message}&success=false`
			);
	}
	reply.sent = true;
};

const sendSuccessResponse = (reply, response, options = {}) => {
	if (!options.redirectURL) {
		if (options.refreshToken) {
			reply.setCookie(
				"refreshToken",
				options.refreshToken,
				getRefreshTokenOptns()
			);

			// Add refreshToken to response if REFRESH_RESPONSE is enabled
			if (configs.REFRESH_RESPONSE) {
				response.refreshToken = options.refreshToken;
			}
		}
		if (options.clearCookie) {
			reply.clearCookie("refreshToken", getRefreshTokenOptns());
		}
		reply.code(response.statusCode).send({
			...response,
			success: true,
		});
	} else {
		reply
			.code(302)
			.redirect(
				`${options.redirectURL}?statusCode=${response.statusCode}&message=${response.message}&success=true`
			);
	}
	reply.sent = true;
};

const redirectWithToken = (reply, token, options) => {
	reply
		.code(302)
		.redirect(`${options.redirectURL}?token=${token}&success=true`);
	reply.sent = true;
};

module.exports = {
	sendErrorResponse,
	sendSuccessResponse,
	redirectWithToken,
};
