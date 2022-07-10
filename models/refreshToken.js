const crypto = require("crypto");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const { configs, keywords } = require("../configs");

const refreshTokenSchema = new mongoose.Schema({
	rtid: String,
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
	isRevoked: {
		type: Boolean,
		default: false,
	},
	revokedBy: String,
});

refreshTokenSchema.methods.getJWT = function () {
	return jwt.sign(
		{
			rtid: this.rtid,
		},
		configs.REFRESH_KEY,
		{
			expiresIn: "30d",
		}
	);
};

refreshTokenSchema.methods.isExpired = function () {
	return Date.now() >= this.expiresAt;
};

refreshTokenSchema.methods.isValid = function () {
	return !Date.now() >= this.expiresAt || !this.isRevoked;
};

refreshTokenSchema.methods.revoke = function (revokedBy) {
	this.revokedBy = revokedBy;
	this.isRevoked = true;
	this.expiresAt = Date.now();
};

const RefreshToken = mongoose.model("RefreshToken", refreshTokenSchema);

const getRefreshToken = async (user, requestIp) => {
	const rtid = crypto.randomBytes(8).toString("hex");

	let rt = await RefreshToken.create({
		rtid,
		user,
		createdBy: requestIp,
		expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
	});

	rt.save();

	return rt.getJWT();
};

const getRefreshTokenOptns = () => {
	const options = {
		expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
		httpOnly: true,
		path: "/api/v1/auth/refresh",
		signed: true,
		sameSite: false,
	};
	if (configs.ENVIRONMENT === keywords.PRODUCTION_ENV) {
		options.secure = true;
	}
	return options;
};

const getRftById = async (rtid) => {
	return await RefreshToken.findOne({
		rtid: rtid,
		isRevoked: false,
	});
};

const revokeAllRfTokenByUser = async (user, revokedBy) => {
	await RefreshToken.updateMany(
		{ user, isRevoked: false },
		{ $set: { isRevoked: true, revokedBy: revokedBy, expiresAt: Date.now() } }
	);
};

module.exports = {
	RefreshToken,
	getRefreshToken,
	revokeAllRfTokenByUser,
	getRefreshTokenOptns,
	getRftById,
};
