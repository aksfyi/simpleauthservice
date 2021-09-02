const nodemailer = require("nodemailer");
const { configs } = require("../configs");
const mustache = require("mustache");

const sendEmail = async (options) => {
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

		const msg = await transporter.sendMail(message);

		console.log("EMAIL SENT : %s", msg.messageId);
		return "Email Sent";
	} else {
		return "Failed to send email. Please configure SMTP";
	}
};

const renderTemplate = (view, template) => {
	return mustache.render(template, view);
};

module.exports = {
	sendEmail,
	renderTemplate,
};
