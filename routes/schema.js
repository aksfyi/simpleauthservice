const authSchema = {
	signup: {
		type: "object",
		properties: {
			name: { type: "string" },
			email: { type: "string" },
			password: { type: "string" },
		},
		required: ["name", "email", "password"],
	},

	signin: {
		type: "object",
		properties: {
			email: { type: "string" },
			password: { type: "string" },
		},
		required: ["email", "password"],
	},

	tokenCheck: {
		type: "object",
		properties: {
			token: { type: "string" },
		},
		required: ["token"],
	},

	resetPasswordRequestToken: {
		type: "object",
		properties: {
			email: { type: "string" },
		},
		required: ["email"],
	},

	resetPasswordFromToken: {
		type: "object",
		properties: {
			token: { type: "string" },
			password: { type: "string" },
			confirmPassword: { type: "string" },
		},
		required: ["token", "password", "confirmPassword"],
	},

	updatePassword: {
		type: "object",
		properties: {
			currentPassword: { type: "string" },
			password: { type: "string" },
			confirmPassword: { type: "string" },
		},
		required: ["currentPassword", "password", "confirmPassword"],
	},

	refreshTokenCheck: {
		type: "object",
		properties: {
			refreshToken: { type: "string" },
		},
		required: ["refreshToken"],
	},
};

module.exports = {
	authSchema,
};
