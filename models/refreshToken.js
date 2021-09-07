const crypto = require("crypto");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const refreshTokenSchema = new mongoose.Schema({
	token: String,
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
	},
	createdAt: {
		type: Date,
		default: Date.now(),
	},
	expiresAt: {
		type: Date,
		default: Date.now() + 30 * 24 * 60 * 60 * 1000, //expires in 30 days
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

module.exports = mongoose.model("RefreshToken", refreshTokenSchema);
