const { configs } = require("../../configs");
const {
	responseErrors,
	jwtSecurity,
	getSuccessObject,
	getEmailStatusResponse,
} = require("./common");

const errors = responseErrors;

const authenticationSchema = {
	signup: {
		description:
			"Sign up to the service. Returns JWT token and sets Refresh token as cookie.\
			(Sent in response if config - REFRESH_RESPONSE is enabled)",
		tags: ["Sign In and Sign Up"],
		body: {
			type: "object",
			properties: {
				name: { type: "string", example: "Akshay" },
				email: {
					type: "string",
					example: "example@example.com",
					format: "email",
				},
				password: { type: "string", example: "asdhfgjkfhey%&6da" },
			},
			required: ["name", "email", "password"],
		},
		response: {
			201: getSuccessObject(201, true, "Account successfully created", {
				token: { type: "string" },
				refreshToken: {
					type: "string",
				},
				...getEmailStatusResponse(),
			}),
			400: errors[404],
			500: errors[500],
		},
	},
	signin: {
		description:
			"Sign in .Returns JWT token and sets Refresh token as cookie.\
			(Sent in response if config - REFRESH_RESPONSE is enabled)",
		tags: ["Sign In and Sign Up"],
		body: {
			type: "object",
			properties: {
				email: {
					type: "string",
					example: "example@example.com",
					format: "email",
				},
				password: { type: "string", example: "asdhfgjkfhey%&6da" },
			},
			required: ["email", "password"],
		},
		response: {
			200: getSuccessObject(200, true, "Successful Sign in", {
				token: { type: "string" },
				refreshToken: { type: "string" },
				...getEmailStatusResponse(),
			}),
			400: errors[400],
			500: errors[500],
			404: errors[404],
		},
	},
	confirmEmailGet: {
		description:
			"Check if the confirm email token is valid and redirects to frontend",
		tags: ["Confirm Email Address"],
		querystring: {
			type: "object",
			properties: {
				token: { type: "string" },
			},
			required: ["token"],
		},
		response: {
			302: {
				type: "object",
				description: `Redirects to ${configs.APP_CONFIRM_EMAIL_REDIRECT} .Success response will have success:true\
				and token value added as query parameters.\
				Failure value will have success:false error & message`,
			},
		},
	},
	confirmEmailPut: {
		description:
			"Check if the confirm email token is valid, update the user document\
			 and send success or failure response",
		tags: ["Confirm Email Address"],
		body: {
			type: "object",
			properties: {
				token: { type: "string" },
			},
			required: ["token"],
		},
		response: {
			200: getSuccessObject(200, true, "Email Successfully confirmed", {}),
			400: errors[400],
			500: errors[500],
		},
	},
	confirmEmailPost: {
		description: "Request for link to confirm email address",
		tags: ["Confirm Email Address"],
		response: {
			200: getSuccessObject(200, true, "Confirmation email sent", {
				...getEmailStatusResponse(),
			}),
			400: errors[400],
			500: errors[500],
			403: errors[403],
		},
		security: jwtSecurity,
	},
	resetPasswordPost: {
		description: "Request link for resetting password",
		tags: ["Reset Password"],
		body: {
			type: "object",
			properties: {
				email: { type: "string" },
			},
			required: ["email"],
		},
		response: {
			200: getSuccessObject(200, true, "Reset Link Sent to Email", {
				...getEmailStatusResponse(),
			}),
			400: errors[400],
			404: errors[404],
			500: errors[500],
		},
	},
	resetPasswordGet: {
		description:
			"Check if the reset password token is valid and redirects to frontend",
		tags: ["Reset Password"],
		querystring: {
			type: "object",
			properties: {
				token: { type: "string" },
			},
			required: ["token"],
		},
		response: {
			302: {
				type: "object",
				description: `Redirects to ${configs.APP_RESET_PASSWORD_REDIRECT} .\
				Success response will have success:true\
				and token value added as query parameters.\
				Failure value will have success:false error & message`,
			},
		},
	},
	resetPasswordPut: {
		description:
			"Reset the password using token and send success or failure response",
		tags: ["Reset Password"],
		body: {
			type: "object",
			properties: {
				token: { type: "string" },
				password: { type: "string" },
				confirmPassword: { type: "string" },
			},
			required: ["token", "password", "confirmPassword"],
		},
		response: {
			200: getSuccessObject(200, true, "Password Reset Successful", {
				...getEmailStatusResponse(),
			}),
			400: errors[400],
			500: errors[500],
		},
	},
	updatePassword: {
		description: "Update password when logged in",
		tags: ["User"],
		body: {
			type: "object",
			properties: {
				currentPassword: { type: "string" },
				password: { type: "string" },
				confirmPassword: { type: "string" },
			},
			required: ["currentPassword", "password", "confirmPassword"],
		},
		security: jwtSecurity,
		response: {
			200: getSuccessObject(200, true, "Password Reset Successful", {
				...getEmailStatusResponse(),
			}),
			400: errors[400],
			500: errors[500],
			403: errors[403],
		},
	},
	profile: {
		description: "Get profile information of the logged in user",
		tags: ["User"],
		security: jwtSecurity,
		response: {
			200: getSuccessObject(200, true, "Get Profile Successful", {
				role: { type: "string" },
				email: { type: "string", format: "email" },
				name: { type: "string" },
				isEmailConfirmed: { type: "boolean" },
				isDeactivated: { type: "boolean" },
			}),
			400: errors[400],
			500: errors[500],
			403: errors[403],
		},
	},
	refreshJWTToken: {
		description:
			"Get new JWT token from refresh token in the cookie. Sets new Refresh token in the cookie.\
			(Sent in response if config - REFRESH_RESPONSE is enabled)",
		tags: ["Refresh Token"],
		body: {
			type: "object",
			properties: {
				refreshToken: {
					type: "string",
					description:
						"Optional (if sent the route uses this instead\
					 of the one in cookie)",
				},
			},
		},
		response: {
			200: getSuccessObject(200, true, "Refresh token successful", {
				token: { type: "string" },
				refreshToken: { type: "string" },
			}),
			400: errors[404],
			500: errors[500],
		},
	},
	revokeRefreshToken: {
		description:
			"Revoke Refresh Token Sent from cookie. Used when logging out users",
		tags: ["Refresh Token"],
		security: jwtSecurity,
		response: {
			200: getSuccessObject(
				200,
				true,
				"Refresh Token Successfully Revoked",
				{}
			),
			400: errors[404],
			500: errors[500],
			403: errors[403],
		},
	},
	revokeAll: {
		description: "Revoke All refresh tokens of the logged in user",
		tags: ["Refresh Token"],
		security: jwtSecurity,
		response: {
			200: getSuccessObject(
				200,
				true,
				"All Refresh Tokens Successfully Revoked",
				{}
			),
			400: errors[404],
			500: errors[500],
			403: errors[403],
		},
	},
};

module.exports = {
	authenticationSchema,
};
