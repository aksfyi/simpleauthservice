const mongoose = require("mongoose");
const { hashPasswd } = require("./user");

// TODO : Passwordless login implementation

const passwordLessSchema = new mongoose.Schema({
	token: String,
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
	expiresAt: {
		type: Date,
	},
	createdBy: {
		type: String,
	},
	isValid: {
		type: Boolean,
	},
});

passwordLessSchema.methods.isExpired = function () {
	return Date.now() >= this.expiresAt;
};

const PasswordlessLogin = mongoose.model(
	"PasswordlessLogin",
	passwordLessSchema
);

const getActivePasswordlessTokens = (user, requestIp) => {
	// TODO : get passwordless token - number of active links for the user
};

const createPasswordlessToken = (user, requestIp) => {
	const passwordlessToken = crypto.randomBytes(25).toString("hex");

	const hashedToken = await hashPasswd(passwordlessToken);

	let pt = await RefreshToken.create({
		token: hashedToken,
		user,
		createdBy: requestIp,
		expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
	});

	pt.save();

	return passwordlessToken;
};

exports = {
	PasswordlessLogin,
	getActivePasswordlessLinks,
	createPasswordlessToken,
};
