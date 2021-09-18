require("dotenv").config();

const configs = {
	MONGO_URI: process.env.MONGO_URI,
	ENVIRONMENT: process.env.ENVIRONMENT || "dev",
	CHECK_ADMIN: process.env.CHECK_ADMIN || 1,
	JWT_KEY: process.env.JWT_KEY,
	PORT: process.env.PORT || 5000,
	AUTH_SERVICE_HOST:
		process.env.AUTH_SERVICE_HOST ||
		`http://localhost:${process.env.PORT || 5000}`,
	ALLOW_CORS_ORIGIN: process.env.ALLOW_CORS_ORIGIN,
	SEND_NEW_LOGIN_EMAIL: process.env.SEND_NEW_LOGIN_EMAIL,

	SMTP_HOST: process.env.SMTP_HOST,
	SMTP_PORT: process.env.SMTP_PORT,
	SMTP_EMAIL: process.env.SMTP_EMAIL,
	SMTP_PASSWORD: process.env.SMTP_PASSWORD,
	FROM_NAME: process.env.FROM_NAME,
	FROM_EMAIL: process.env.FROM_EMAIL,

	IS_SMTP_CONFIGURED: false,
	APP_NAME: process.env.APP_NAME || "",
	APP_DOMAIN: process.env.APP_DOMAIN || "",
	APP_CONFIRM_EMAIL_REDIRECT: process.env.APP_CONFIRM_EMAIL_REDIRECT,
	APP_RESET_PASSWORD_REDIRECT: process.env.APP_RESET_PASSWORD_REDIRECT,

	// Internal Oauth2 provider configs
	PROVIDER_GITHUB: "github",
	SUPPORTED_PROVIDERS: ["github"],

	GITHUB_CONFIGS: {
		ACCESS_TOKEN: "https://github.com/login/oauth/access_token",
		AUTHORIZE: "https://github.com/login/oauth/authorize",
		SCOPE: "user:email",
		CLIENT_ID: process.env.GITHUB_CLIENT_ID,
		CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
		REDIRECT_URI: process.env.GITHUB_REDIRECT_URI,
		CONFIGURED:
			process.env.GITHUB_CLIENT_ID &&
			process.env.GITHUB_CLIENT_SECRET &&
			process.env.GITHUB_REDIRECT_URI
				? true
				: false,
	},
};

if (
	configs.SMTP_HOST &&
	configs.SMTP_PORT &&
	configs.SMTP_EMAIL &&
	configs.SMTP_PASSWORD &&
	configs.FROM_EMAIL &&
	configs.FROM_NAME
) {
	configs.IS_SMTP_CONFIGURED = true;
}

module.exports = {
	configs,
};
