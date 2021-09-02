const crypto = require("crypto");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const RefreshToken = require("../models/refreshToken");

const userSchema = new mongoose.Schema({
	name: {
		type: String,
		required: [true, "Please submit the name"],
	},
	email: {
		type: String,
		unique: true,
		required: [true, "Please submit an email"],
		match: [
			/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
			"Please submit a valid email",
		],
	},
	password: {
		type: String,
		required: [true, "Please submit a password"],
		minlength: 8,
		select: false, // this will not be added to db
	},
	role: {
		type: String,
		enum: ["user", "admin"],
		default: "user",
	},
	isEmailConfirmed: {
		type: Boolean,
		default: false,
	},
	pwResetToken: String,
	pwResetExpire: Date,
	confirmEmailToken: String,
	confirmEmailTokenExpire: Date,
	isAccountVerified: {
		type: Boolean,
		default: false,
	},
	twoFACode: String, // No support as of now
	twoFAExpire: Date, // No support as of now
	twoFAEnabled: {
		// No support as of now
		type: Boolean,
		default: false,
	},
	isDeactivated: {
		type: Boolean,
		default: false,
	},
	createdAt: {
		type: Date,
		default: Date.now(),
	},
	deactivatedAt: Date,
});

// Function attached to userSchema to get the JWT token
userSchema.methods.getJWT = function () {
	return jwt.sign(
		{
			id: this._id,
			role: this.role,
			email: this.email,
			name: this.name,
			isEmailConfirmed: this.isEmailConfirmed,
			isAccountVerified: this.isAccountVerified,
			isDeactivated: this.isDeactivated,
		},
		process.env.JWT_KEY,
		{
			expiresIn: "15m",
		}
	);
};

// Function to match the password entered by the user and stored password
userSchema.methods.matchPasswd = async function (enteredPasswd) {
	return await bcrypt.compare(enteredPasswd, this.password);
};

// To get the token to reset the password
userSchema.methods.getPwResetToken = function () {
	const resetToken = crypto.randomBytes(50).toString("hex");

	// Store the hash of the resetPasswdToken
	this.pwResetToken = crypto
		.createHash("sha256")
		.update(resetToken)
		.digest("hex");

	// Set token expiration to 30 mins from now
	this.pwResetExpire = Date.now() + 30 * 60 * 1000;

	return resetToken;
};

userSchema.methods.isPwResetTokenExpired = function () {
	if (!this.pwResetExpire) {
		return true;
	}
	return Date.now >= this.pwResetExpire;
};

userSchema.methods.getEmailConfirmationToken = function () {
	const confirmationToken = crypto.randomBytes(30).toString("hex");

	// Store the hash of the resetPasswdToken
	this.confirmEmailToken = crypto
		.createHash("sha256")
		.update(confirmationToken)
		.digest("hex");

	// Set token expiration to 6 hours from now
	this.confirmEmailTokenExpire = Date.now() + 6 * 60 * 60 * 1000;

	return confirmationToken;
};

userSchema.methods.isConfirmEmailTokenExpired = function () {
	if (!this.confirmEmailTokenExpire) {
		return true;
	}
	return Date.now >= this.confirmEmailTokenExpire;
};

module.exports = mongoose.model("User", userSchema);
