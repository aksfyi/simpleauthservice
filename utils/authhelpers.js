const bcrypt = require("bcryptjs");
const RefreshToken = require("../models/refreshToken");
const crypto = require("crypto");
const { configs, keywords } = require("../configs");

const hashPasswd = async (passwd) => {
	const salt = await bcrypt.genSalt(10);
	hashedPasswd = await bcrypt.hash(passwd, salt);
	return hashedPasswd;
};

const getRefreshTokenOptns = () => {
	const options = {
		expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
		httpOnly: true,
		path: "/api/v1/auth/refresh",
		signed: true,
	};
	if (configs.ENVIRONMENT === keywords.PRODUCTION_ENV) {
		options.secure = true;
	}
	return options;
};

const getRefreshToken = async (user, requestIp) => {
	const refreshToken = crypto.randomBytes(50).toString("hex");

	// Store the hash of the refreshToken
	const hashedToken = crypto
		.createHash("sha256")
		.update(refreshToken)
		.digest("hex");

	let rt = await RefreshToken.create({
		token: hashedToken,
		user,
		createdBy: requestIp,
		expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
	});

	rt.save();

	return refreshToken;
};

const revokeAllRfTokenByUser = async (user, revokedBy) => {
	await RefreshToken.updateMany(
		{ user, isRevoked: false },
		{ $set: { isRevoked: true, revokedBy: revokedBy, expiresAt: Date.now() } }
	);
};

module.exports = {
	hashPasswd,
	getRefreshToken,
	revokeAllRfTokenByUser,
	getRefreshTokenOptns,
};
