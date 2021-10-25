const { default: axios } = require("axios");
const { configs } = require("../configs");
const User = require("../models/user");
const { getRefreshToken } = require("../utils/authhelpers");
const {
	sendNewLoginEmail,
	confirmationEmailHelper,
} = require("../utils/services/sendEmail");
const { OauthProviderLogin } = require("../utils/services/oauthProviderLogin");
const { sendErrorResponse, sendSuccessResponse } = require("./responseHelpers");
const crypto = require("crypto");

// @route 	GET /api/v1/auth/oauth/:provider
// @desc	Route which accepts state and returns
//			oauth provider login uri
const getOauthProviderLogin = async (request, reply) => {
	let state = request.query.state;
	const provider = request.provider;
	if (!state) {
		state = crypto.randomBytes(10).toString("hex");
	}
	const oauthHandler = new OauthProviderLogin(provider);
	const loginUrl = oauthHandler.getRedirectUrl(state);
	if (!loginUrl) {
		sendErrorResponse(reply, 400, "Invalid Login Provider");
	}
	sendSuccessResponse(reply, {
		statusCode: 200,
		state,
		message: "Successful",
		loginUrl,
	});
};

// @route 	POST /api/v1/auth/oauth/:provider
// @desc	Route which accepts code and returns
//			jwt and refresh token if the code is valid
const postOauthProviderLogin = async (request, reply) => {
	const provider = request.provider;
	const { code } = request.body;
	const oauthHandler = new OauthProviderLogin(provider);
	const userDetails = await oauthHandler.getUserDetails(code);
	let role;
	if (!userDetails || userDetails.error) {
		sendErrorResponse(
			reply,
			userDetails.error ? 400 : 404,
			userDetails.error ||
				"Could not get the required details from Oauth provider."
		);
	}
	if (configs.CHECK_ADMIN) {
		const count = await User.countDocuments();
		if (!count) {
			role = "admin";
		}
	}

	await oauthLoginHelper(request, reply, {
		...userDetails,
		role,
	});
};

/**
 * Helper Function to sign in or sign up using oauth
 *
 *  userInfo keys :
 * name : User's name
 * email : User's email
 * provider : Oauth2 Provider (example : "github" , "google")
 * verified : If the email of the user is verified
 * role : User's role (example : "user" , "admin")
 */
const oauthLoginHelper = async (request, reply, userInfo) => {
	const { name, email, provider, verified, role } = userInfo;
	let confirmationToken;
	let emailStatus = {
		success: true,
		message: "Email was not sent, since user email was already verified",
	};
	let user = await User.findOne({
		email,
		isDeactivated: false,
	});
	if (user) {
		const refreshToken = await getRefreshToken(user, request.ipAddress);

		const emailStatus = await sendNewLoginEmail(user, request);

		sendSuccessResponse(
			reply,
			{
				statusCode: 200,
				message: "Signed in",
				token: user.getJWT(),
				emailSuccess: emailStatus.success,
				emailMessage: emailStatus.message,
			},
			{ refreshToken }
		);
	} else {
		user = await User.create({
			name,
			email,
			uid: crypto.randomBytes(15).toString("hex"),
			isEmailConfirmed: verified,
			provider,
			role,
		});
		if (!verified) {
			confirmationToken = user.getEmailConfirmationToken();
		}
		user.save({ validateBeforeSave: true });
		if (confirmationToken) {
			emailStatus = await confirmationEmailHelper(
				user,
				request,
				confirmationToken
			);
		}
		const refreshToken = await getRefreshToken(user, request.ipAddress);
		sendSuccessResponse(
			reply,
			{
				statusCode: 201,
				message: "Sign up successful",
				token: user.getJWT(),
				emailSuccess: emailStatus.success,
				emailMessage: emailStatus.message,
			},
			{ refreshToken }
		);
	}
};

module.exports = {
	getOauthProviderLogin,
	postOauthProviderLogin,
};
