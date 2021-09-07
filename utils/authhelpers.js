const bcrypt = require("bcryptjs");
const RefreshToken = require("../models/refreshToken");
const crypto = require("crypto");

const hashPasswd = async (passwd) => {
	const salt = await bcrypt.genSalt(10);
	hashedPasswd = await bcrypt.hash(passwd, salt);
	return hashedPasswd;
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
	});

	rt.save();

	return refreshToken;
};

const revokeAllRfTokenByUser = async (user, revokedBy) => {
	console.log("revoking all tokens");
	await RefreshToken.updateMany(
		{ user, isRevoked: false },
		{ $set: { isRevoked: true, revokedBy: revokedBy, expiresAt: Date.now() } }
	);
};

module.exports = {
	hashPasswd,
	getRefreshToken,
	revokeAllRfTokenByUser,
};
