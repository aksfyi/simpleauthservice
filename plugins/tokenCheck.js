const { configs } = require("../configs");
const { sendErrorResponse } = require("../handlers/responseHelpers");
const crypto = require("crypto");
const User = require("../models/user");

const tokenCheck = (type, shouldRedirect) => {
	return async function (request, reply) {
		let { token } = request.query;
		if (!token) {
			token = request.body.token;
		}
		let redirectURL;
		let user;
		let check = true;
		if (shouldRedirect) {
			if (type === "password") {
				if (!configs.APP_RESET_PASSWORD_REDIRECT) {
					sendErrorResponse(
						reply,
						500,
						"Please configure APP_RESET_PASSWORD_REDIRECT"
					);
				}
				redirectURL = configs.APP_RESET_PASSWORD_REDIRECT;
			} else if (type === "confirmEmail") {
				if (!configs.APP_CONFIRM_EMAIL_REDIRECT) {
					sendErrorResponse(
						reply,
						500,
						"Please configure APP_CONFIRM_EMAIL_REDIRECT"
					);
				}
				redirectURL = configs.APP_CONFIRM_EMAIL_REDIRECT;
			}
		}

		if (!token) {
			console.log("Error : token");

			sendErrorResponse(reply, 400, "Invalid Token", redirectURL);
		}

		const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

		if (type === "password") {
			console.log("finding password token user");
			user = await User.findOne({
				pwResetToken: hashedToken,
				isDeactivated: false,
				isEmailConfirmed: true,
			});
		} else if (type === "confirmEmail") {
			console.log("finding confirm email users");
			user = await User.findOne({
				confirmEmailToken: hashedToken,
				isDeactivated: false,
				isEmailConfirmed: false,
			});
		}

		if (!user) {
			console.log("Error : user not found");
			sendErrorResponse(reply, 400, "Invalid Token", redirectURL);
		}
		if (type === "password") {
			check = user.isPwResetTokenExpired();
		} else if (type === "confirmEmail") {
			check = user.isConfirmEmailTokenExpired();
		}

		if (check) {
			sendErrorResponse(reply, 400, "Link expired", redirectURL);
		}

		request.userModel = user;
	};
};

module.exports = {
	tokenCheck,
};
