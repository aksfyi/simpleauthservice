const { default: axios } = require("axios");
const { configs } = require("../configs");
const User = require("../models/user");
const { getRefreshToken } = require("../utils/authhelpers");
const {
	sendNewLoginEmail,
	confirmationEmailHelper,
} = require("../utils/sendEmail");
const { sendErrorResponse, sendSuccessResponse } = require("./responseHelpers");

// POST /api/v1/auth/oauth/github/signin
// Route which accepts github access token and performs
// user sign in or sign up
const githubLogin = async (request, reply) => {
	const { token } = request.body;
	const provider = "github";

	const profileResponse = await axios.get("https://api.github.com/user", {
		headers: {
			Authorization: `token ${token}`,
		},
	});
	const emailResponse = await axios.get("https://api.github.com/user/emails", {
		headers: {
			Authorization: `token ${token}`,
		},
	});

	const { name } = profileResponse.data;
	const emailList = emailResponse.data;
	let email, verified, role;
	let i = 0;

	// Set Role to admin if no users exist
	if (configs.CHECK_ADMIN) {
		const count = await User.countDocuments();
		if (!count) {
			role = "admin";
		}
	}

	for (i = 0; i < emailList.length; i++) {
		if (emailList[i]["primary"]) break;
	}
	if (emailList[i]["primary"] && emailList[i]["email"]) {
		email = emailList[i]["email"];
		verified = emailList[i]["verified"];
		await oauthLoginHelper(request, reply, {
			name,
			email,
			provider,
			verified,
			role,
		});
	}
	sendErrorResponse(reply, 400, "Primary email not found in github");
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
	let emailMessage = "";
	let user = await User.findOne({
		email,
		isDeactivated: false,
	});
	if (user) {
		const refreshToken = await getRefreshToken(user, request.ip);

		await sendNewLoginEmail(user, request);

		sendSuccessResponse(reply, {
			statusCode: 200,
			message: "Signed in",
			token: user.getJWT(),
			refreshToken,
		});
	} else {
		user = await User.create({
			name,
			email,
			isEmailConfirmed: verified,
			provider,
			role,
		});
		if (!verified) {
			confirmationToken = user.getEmailConfirmationToken();
		}
		user.save({ validateBeforeSave: true });
		if (confirmationToken) {
			emailMessage = await confirmationEmailHelper(
				user,
				request,
				confirmationToken
			);
		}
		const refreshToken = await getRefreshToken(user, request.ip);
		sendSuccessResponse(reply, {
			statusCode: 201,
			message: "Sign up successful." + emailMessage,
			token: user.getJWT(),
			refreshToken,
		});
	}
};

module.exports = {
	githubLogin,
};
