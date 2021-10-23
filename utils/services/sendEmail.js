const nodemailer = require("nodemailer");
const { configs } = require("../../configs");
const mustache = require("mustache");
const { newLoginTemplate } = require("../emailTemplates/newLoginEmail");
const {
	passwordChangedTemplate,
} = require("../emailTemplates/passwordChanged");
const { confirmEmailTemplate } = require("../emailTemplates/confirmEmail");
const { resetPasswordTemplate } = require("../emailTemplates/resetPassword");

const sendEmail = async (options) => {
	if (configs.DISABLE_MAIL) {
		return emailStatus(false, "Mailing is disabled");
	}
	if (configs.IS_SMTP_CONFIGURED) {
		const transporter = nodemailer.createTransport({
			host: configs.SMTP_HOST,
			port: configs.SMTP_PORT,
			auth: {
				user: configs.SMTP_EMAIL,
				pass: configs.SMTP_PASSWORD,
			},
		});

		const message = {
			from: `${configs.FROM_NAME} <${configs.FROM_EMAIL}>`,
			to: options.email,
			subject: options.subject,
			html: options.html,
		};

		await transporter.sendMail(message);

		return emailStatus(true, "Email Sent");
	} else {
		return emailStatus(false, "Failed to send email. Please configure SMTP");
	}
};

// helper function to send
const emailStatus = (success, message) => {
	return {
		success,
		message,
	};
};

const renderTemplate = (view, template) => {
	return mustache.render(template, view);
};

// Send Email confirmation mail to the user
const confirmationEmailHelper = async (user, request, confirmationToken) => {
	const confirmationUrl = `${configs.HTTP_PROTOCOL || request.protocol}://${
		request.hostname
	}/api/v1/auth/confirmEmail?token=${confirmationToken}`;

	return await sendEmail({
		email: user.email,
		subject: `Confirm your email address ${
			configs.APP_NAME ? `to get started on ${configs.APP_NAME}` : ""
		}`,
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

// Send Password Reset email to the user
const passwordResetEmailHelper = async (user, request, pwResetToken) => {
	const resetUrl = `${configs.HTTP_PROTOCOL || request.protocol}://${
		request.hostname
	}/api/v1/auth/resetPassword?token=${pwResetToken}`;

	return await sendEmail({
		email: user.email,
		subject: `Password Reset Request ${
			configs.APP_NAME ? `for ${configs.APP_NAME}` : ""
		} `,
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
};

// Send password changed email to the user
const passwordChangedEmailAlert = async (user, request) => {
	return await sendEmail({
		email: user.email,
		subject: "Security Alert",
		html: renderTemplate(
			{
				username: user.name,
				appName: configs.APP_NAME,
				appDomain: configs.appDomain,
				ip: request.ipAddress,
				ua: request.headers["user-agent"],
			},
			passwordChangedTemplate
		),
	});
};

const sendNewLoginEmail = async (user, request) => {
	if (configs.SEND_NEW_LOGIN_EMAIL) {
		return await sendEmail({
			email: user.email,
			subject: `Important : New Login to your ${
				configs.APP_NAME || ""
			} account`,
			html: renderTemplate(
				{
					username: user.name,
					appName: configs.APP_NAME,
					appDomain: configs.APP_DOMAIN,
					ip: request.ipAddress,
					ua: request.headers["user-agent"],
				},
				newLoginTemplate
			),
		});
	}
	return emailStatus(false, "New login email is disabled");
};

module.exports = {
	sendEmail,
	renderTemplate,
	confirmationEmailHelper,
	passwordResetEmailHelper,
	passwordChangedEmailAlert,
	sendNewLoginEmail,
};
