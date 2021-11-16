const { configs } = require("../configs");
const { sendErrorResponse } = require("../handlers/responseHelpers");
const crypto = require("crypto");
const User = require("../models/user");

const tokenCheck = (type, shouldRedirect) => {
	return async function (request, reply) {
		let token;
		if (request.method === "PUT" || request.method === "POST") {
			token = request.body.token;
		} else {
			token = request.query.token;
		}

		let redirectURL;
		let user;
		let check = true;
		if (shouldRedirect) {
			if (type === "password") {
				if (!configs.APP_RESET_PASSWORD_REDIRECT) {
					return sendErrorResponse(
						reply,
						500,
						"Please configure APP_RESET_PASSWORD_REDIRECT"
					);
				}
				redirectURL = configs.APP_RESET_PASSWORD_REDIRECT;
			} else if (type === "confirmEmail") {
				if (!configs.APP_CONFIRM_EMAIL_REDIRECT) {
					return sendErrorResponse(
						reply,
						500,
						"Please configure APP_CONFIRM_EMAIL_REDIRECT"
					);
				}
				redirectURL = configs.APP_CONFIRM_EMAIL_REDIRECT;
			}
		}

		if (!token) {
			return sendErrorResponse(reply, 400, "Invalid Token", { redirectURL });
		}

		const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

		if (type === "password") {
			user = await User.findOne({
				pwResetToken: hashedToken,
				isDeactivated: false,
			});
		} else if (type === "confirmEmail") {
			user = await User.findOne({
				confirmEmailToken: hashedToken,
				isDeactivated: false,
				isEmailConfirmed: false,
			});
		}

		if (!user) {
			return sendErrorResponse(reply, 400, "Invalid Token", { redirectURL });
		}
		if (type === "password") {
			check = user.isPwResetTokenExpired();
		} else if (type === "confirmEmail") {
			check = user.isConfirmEmailTokenExpired();
		}

		if (check) {
			return sendErrorResponse(reply, 400, "Link expired", { redirectURL });
		}

		request.userModel = user;
	};
};

module.exports = {
	tokenCheck,
};
