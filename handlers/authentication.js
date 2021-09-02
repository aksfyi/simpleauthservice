const {
	hashPasswd,
	getRefreshToken,
	revokeAllRfTokenByUser,
} = require("../utils/authhelpers");

const User = require("../models/user");
const RefreshToken = require("../models/refreshToken");
const crypto = require("crypto");
const { configs } = require("../configs");
const { sendEmail, renderTemplate } = require("../utils/sendEmail");
const {
	sendErrorResponse,
	sendSuccessResponse,
	redirectWithToken,
} = require("./responseHelpers");
const {
	confirmEmailTemplate,
} = require("../utils/emailTemplates/confirmEmail");
const {
	passwordChangedTemplate,
} = require("../utils/emailTemplates/passwordChanged");
const {
	resetPasswordTemplate,
} = require("../utils/emailTemplates/resetPassword");
const { newLoginTemplate } = require("../utils/emailTemplates/newLoginEmail");

// @route	POST /api/v1/auth/signup
// @desc	handler for registering user to database, returns
// 			jwt and refresh token
// @access	Public
const registerUser = async (request, reply) => {
	let { name, email, password } = request.body;
	password = await hashPasswd(password);
	let role = "user";

	// Set Role to admin if no users exist
	if (configs.CHECK_ADMIN) {
		const count = await User.countDocuments();
		if (!count) {
			role = "admin";
		}
	}

	const user = await User.create({
		name,
		email,
		password,
		role,
	});

	const confirmationToken = user.getEmailConfirmationToken();
	user.save({ validateBeforeSave: false });

	const refreshToken = await getRefreshToken(user, request.ip);

	emailMessage = await confirmationEmailHelper(
		user,
		request,
		confirmationToken
	);

	sendSuccessResponse(reply, {
		statusCode: 201,
		message: "Sign up successful." + emailMessage,
		token: user.getJWT(),
		refreshToken,
	});
};

// @route 	 POST /api/v1/auth/signin
// @desc	 Validates username and password and send a
//			 response with JWT and Refresh token
// @access 	 Public
const signin = async (request, reply) => {
	const { email, password } = request.body;
	const user = await User.findOne({
		email,
		isDeactivated: false,
	}).select("+password");
	if (!user) {
		sendErrorResponse(reply, 400, "User not found");
	} else {
		if (await user.matchPasswd(password)) {
			const refreshToken = await getRefreshToken(user, request.ip);

			if (configs.SEND_NEW_LOGIN_EMAIL) {
				await sendEmail({
					email: user.email,
					subject: `Important : New Login to your ${configs.APP_NAME} account`,
					html: renderTemplate(
						{
							username: user.name,
							appName: configs.APP_NAME,
							appDomain: configs.APP_DOMAIN,
							ip: request.ip,
							ua: request.headers["user-agent"],
						},
						newLoginTemplate
					),
				});
			}

			sendSuccessResponse(reply, {
				statusCode: 200,
				message: "Signed in",
				token: user.getJWT(),
				refreshToken,
			});
		} else {
			sendErrorResponse(reply, 400, "Password Does not match");
		}
	}
};

// @route 	GET /api/v1/auth/confirmEmail
// @desc	Endpoint to confirm the email of the user
// @access	Public (confirm email with the token . JWT is NOT required)
const confirmEmailTokenRedirect = async (request, reply) => {
	redirectWithToken(
		reply,
		request.query.token,
		configs.APP_CONFIRM_EMAIL_REDIRECT
	);
};

const confirmEmail = async (request, reply) => {
	const user = request.userModel;
	user.confirmEmailToken = undefined;
	user.confirmEmailTokenExpire = undefined;
	user.isEmailConfirmed = true;
	user.save({ validateBeforeSave: false });

	sendSuccessResponse(reply, {
		statusCode: 200,
		message: "Account successfully confirmed",
	});
};

// @route	POST /api/v1/auth/confirmEmail
// @desc	Request to send confirmation email again
// @access 	Private (JWT TOKEN REQUIRED)
const requestConfirmationEmail = async (request, reply) => {
	if (request.user.isEmailConfirmed) {
		sendErrorResponse(reply, 400, "Email already confirmed");
	}
	const user = request.userModel;
	if (!user) {
		sendErrorResponse(reply, 400, "Email confirmed or user does not exist");
	} else if (!user.isConfirmEmailTokenExpired()) {
		sendErrorResponse(reply, 400, "Please check your email, try again later");
	} else {
		const confirmationToken = user.getEmailConfirmationToken();
		user.save({ validateBeforeSave: false });

		emailMessage = await confirmationEmailHelper(
			user,
			request,
			confirmationToken
		);

		reply.send({
			statusCode: 200,
			message: emailMessage,
		});
	}
};

// @route 	 POST /api/v1/auth/resetPassword
// @desc	 Request to send reset password email
// @access	 Public
const requestResetPasswordToken = async (request, reply) => {
	const user = await User.findOne({
		email: request.body.email,
		isDeactivated: false,
		isEmailConfirmed: true,
	});
	if (!user) {
		sendErrorResponse(
			reply,
			400,
			"User does not exist or email is not verified yet"
		);
	} else if (!user.isPwResetTokenExpired()) {
		sendErrorResponse(reply, 400, "Please check your email, try again later");
	} else {
		const pwResetToken = user.getPwResetToken();
		const resetUrl = `${request.protocol}://${request.hostname}/api/v1/auth/resetPassword?token=${pwResetToken}`;
		await user.save({ validateBeforeSave: false });

		emailMessage = await sendEmail({
			email: user.email,
			subject: "Reset Password Link",
			html: renderTemplate(
				{
					username: user.name,
					buttonHREF: resetUrl,
					appName: configs.APP_NAME,
					appDomain: configs.APP_DOMAIN,
				},
				resetPasswordTemplate
			),
		});

		reply.send({
			statusCode: 200,
			message: emailMessage,
		});
	}
};

// @route 	GET /api/v1/auth/resetPassword
// @desc  	This is executed when user clicks the link sent via email
//		  	verifies the token and redirects to frontend
// @access 	Public
const resetPasswordTokenRedirect = async (request, reply) => {
	redirectWithToken(
		reply,
		request.query.token,
		configs.APP_RESET_PASSWORD_REDIRECT
	);
};

// @route 	PUT /api/v1/auth/resetPassword
// @desc 	Reset password from token (requested from frontend)
// @access	Public
const resetPasswordFromToken = async (request, reply) => {
	const user = request.userModel;
	let { password, confirmPassword } = request.body;
	if (password !== confirmPassword) {
		sendErrorResponse(
			reply,
			400,
			"Password and confirmed password are different"
		);
	} else {
		await revokeAllRfTokenByUser(user, request.ip);

		password = await hashPasswd(password);
		user.password = password;
		//user.pwResetToken = undefined;
		//user.pwResetExpire = undefined;
		user.save();
		await passwordChangedEmailAlert(user, request);

		sendSuccessResponse(reply, {
			statusCode: 200,
			message: "Password Updated",
		});
	}
};

// @route  	PUT /api/v1/auth/updatePassword
// @desc 	Reset the password with current password when the user
//			user is logged in
// @access	Private (JWT TOKEN is required)
const updatePassword = async (request, reply) => {
	const user = request.userModel;
	const { currentPassword, password, confirmPassword } = request.body;
	const checkPassword = await user.matchPasswd(currentPassword);

	if (!checkPassword) {
		sendErrorResponse(reply, 400, "Your entered the wrong password");
	}

	if (password !== confirmPassword) {
		sendErrorResponse(
			reply,
			400,
			"Password and confirmed password are different"
		);
	}
	await revokeAllRfTokenByUser(user, request.ip);

	user.password = await hashPasswd(password);

	user.save();
	await passwordChangedEmailAlert(user, request);

	sendSuccessResponse(reply, {
		statusCode: 200,
		message: "Password Updated",
	});
};

// @route 	/api/v1/auth/refresh
// @desc 	Get new jwt token and refresh token from unused refresh token
//		 	(refresh token should be used only once)
// @access 	Private (JWT is not required but refresh token is required)
const getJWTFromRefresh = async (request, reply) => {
	const { refreshToken } = request.body;
	const rft = await RefreshToken.findOne({
		token: crypto.createHash("sha256").update(refreshToken).digest("hex"),
		isRevoked: false,
	});
	if (!rft) {
		sendErrorResponse(reply, 400, "Invalid Refresh Token");
	}
	if (rft.isExpired()) {
		sendErrorResponse(reply, 400, "Refresh Token Expired");
	}
	const user = await User.findById(rft.user);

	if (!user) {
		sendErrorResponse(reply, 400, "Invalid Refresh Token");
	}

	const jwtToken = user.getJWT();
	rft.revoke(request.ip);
	rft.save();
	const newRefreshToken = await getRefreshToken(user, request.ip);

	sendSuccessResponse(reply, {
		statusCode: 200,
		token: jwtToken,
		refreshToken: newRefreshToken,
	});
};

// @route 	PUT /api/v1/auth/revoke
// @desc	revokes the refresh token
// @access  Private(required JWT in authorization header)
const revokeRefreshToken = async (request, reply) => {
	const { refreshToken } = request.body;
	const rft = await RefreshToken.findOne({
		token: crypto.createHash("sha256").update(refreshToken).digest("hex"),
		isRevoked: false,
	});

	if (!rft) {
		sendErrorResponse(reply, 400, "Invalid Refresh Token");
	}

	const user = await User.findById(rft.user);

	if (!user) {
		sendErrorResponse(reply, 400, "Invalid Refresh Token");
	}

	if (user.email !== request.user.email) {
		// Check whether the refresh token was created by the same user
		sendErrorResponse(reply, 400, "Invalid Refresh Token");
	}

	if (rft.isExpired()) {
		sendErrorResponse(reply, 400, "Refresh Token Expired");
	}
	rft.revoke(request.ip);
	rft.save();
	sendSuccessResponse(reply, {
		statusCode: 200,
		message: "Refresh token successfully revoked",
	});
};

// @route 	PUT /api/v1/auth/revokeAll
// @desc 	Route used to log out of all devices , i.e
// 			revoke all refreshTokens
// @access	Private(requires JWT token in header)
const revokeAllRefreshTokens = async (request, reply) => {
	const user = request.userModel;
	await revokeAllRfTokenByUser(user);
	sendSuccessResponse(reply, {
		statusCode: 200,
		message: "Successfully revoked all tokens",
	});
};

const confirmationEmailHelper = async (user, request, confirmationToken) => {
	const confirmationUrl = `${request.protocol}://${request.hostname}/api/v1/auth/confirmEmail?token=${confirmationToken}`;

	return await sendEmail({
		email: user.email,
		subject: "Email confirmation token",
		html: renderTemplate(
			{
				username: user.name,
				buttonHREF: confirmationUrl,
				appName: configs.APP_NAME,
				appDomain: configs.APP_DOMAIN,
			},
			confirmEmailTemplate
		),
	});
};

const passwordChangedEmailAlert = async (user, request) => {
	return await sendEmail({
		email: user.email,
		subject: "Security Alert",
		html: renderTemplate(
			{
				username: user.name,
				appName: configs.APP_NAME,
				appDomain: configs.appDomain,
				ip: request.ip,
				ua: request.headers["user-agent"],
			},
			passwordChangedTemplate
		),
	});
};

module.exports = {
	registerUser,
	confirmEmail,
	confirmEmailTokenRedirect,
	requestConfirmationEmail,
	requestResetPasswordToken,
	resetPasswordTokenRedirect,
	resetPasswordFromToken,
	updatePassword,
	signin,
	getJWTFromRefresh,
	revokeRefreshToken,
	revokeAllRefreshTokens,
};
