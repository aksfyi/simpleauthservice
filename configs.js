require("dotenv").config();

const configs = {
	MONGO_URI: process.env.MONGO_URI,
	ENVIRONMENT: process.env.ENVIRONMENT || keywords.DEVELOPMENT_ENV,
	CHECK_ADMIN: process.env.CHECK_ADMIN === "0" ? false : true,
	// Fastify will run on 127.0.0.1 if not set
	// Set this to 0.0.0.0 when deploying using docker
	// Check https://www.fastify.io/docs/latest/Getting-Started/#your-first-server
	HOST: process.env.HOST,
	JWT_KEY: process.env.JWT_KEY,
	REFRESH_KEY: process.env.REFRESH_KEY,
	COOKIE_SECRET: process.env.COOKIE_SECRET,
	PORT: process.env.PORT || 5000,
	AUTH_SERVICE_HOST:
		process.env.AUTH_SERVICE_HOST ||
		`http://localhost:${process.env.PORT || 5000}`,
	ALLOW_CORS_ORIGIN: process.env.ALLOW_CORS_ORIGIN,
	SEND_NEW_LOGIN_EMAIL: process.env.SEND_NEW_LOGIN_EMAIL === "1" ? true : false,
	HTTP_PROTOCOL: process.env.HTTP_PROTOCOL,
	REFRESH_RESPONSE: process.env.REFRESH_RESPONSE === "1" ? true : false,
	SMTP_HOST: process.env.SMTP_HOST,
	SMTP_PORT: process.env.SMTP_PORT,
	SMTP_EMAIL: process.env.SMTP_EMAIL,
	SMTP_PASSWORD: process.env.SMTP_PASSWORD,
	FROM_NAME: process.env.FROM_NAME,
	FROM_EMAIL: process.env.FROM_EMAIL,
	DISABLE_MAIL: process.env.DISABLE_MAIL === "1" ? true : false,

	HCAPTCHA_SECRET: process.env.HCAPTCHA_SECRET,
	PROVIDER_LOGIN_EMAIL_CONFIRMATION_REQUIRED:
		process.env.PROVIDER_LOGIN_EMAIL_CONFIRMATION_REQUIRED === "0"
			? false
			: true,
	DISABLE_CAPTCHA:
		process.env.DISABLE_CAPTCHA === "1" || !process.env.HCAPTCHA_SECRET
			? true
			: false,

	DISABLE_EMAIL_LOGIN: process.env.DISABLE_EMAIL_LOGIN === "1" ? true : false,
	HCAPTCHA_VERIFY_URL: "https://hcaptcha.com/siteverify",

	IS_SMTP_CONFIGURED: false,
	APP_NAME: process.env.APP_NAME || "",
	APP_DOMAIN: process.env.APP_DOMAIN || "",
	APP_CONFIRM_EMAIL_REDIRECT: process.env.APP_CONFIRM_EMAIL_REDIRECT,
	APP_RESET_PASSWORD_REDIRECT: process.env.APP_RESET_PASSWORD_REDIRECT,

	APP_DETAILS_CONFIGURED:
		process.env.APP_NAME &&
		process.env.APP_DOMAIN &&
		process.env.APP_CONFIRM_EMAIL_REDIRECT &&
		process.env.APP_RESET_PASSWORD_REDIRECT
			? true
			: false,

	// Internal Oauth2 provider configs
	PROVIDER_GITHUB: "github",
	PROVIDER_GOOGLE: "google",
	SUPPORTED_PROVIDERS: ["github", "google"],

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
	GOOGLE_CONFIGS: {
		ACCESS_TOKEN: "https://www.googleapis.com/oauth2/v4/token",
		AUTHORIZE: "https://accounts.google.com/o/oauth2/v2/auth",
		SCOPE: "profile email",
		CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
		CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
		REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI,
		CONFIGURED:
			process.env.GOOGLE_CLIENT_ID &&
			process.env.GOOGLE_CLIENT_SECRET &&
			process.env.GOOGLE_REDIRECT_URI
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

if (configs.HTTP_PROTOCOL) {
	configs.HTTP_PROTOCOL = configs.HTTP_PROTOCOL.toLowerCase();
	if (!["http", "https"].includes(configs.HTTP_PROTOCOL)) {
		configs.HTTP_PROTOCOL = false;
	}
}

const keywords = {
	DEVELOPMENT_ENV: "development",
	PRODUCTION_ENV: "production",
};

// To send in root Route
checkConfigs = {
	isSMTPconfigured: configs.IS_SMTP_CONFIGURED,
	isOauthProviderConfigured: {
		github: configs.GITHUB_CONFIGS.CONFIGURED,
	},
	isAppDetailsConfigured: configs.APP_DETAILS_CONFIGURED,
	environment: configs.ENVIRONMENT,
	isCORSEnabled: configs.ALLOW_CORS_ORIGIN ? true : false,
};

module.exports = {
	configs,
	checkConfigs,
	keywords,
};
