const crypto = require("crypto");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { configs } = require("../configs");

const userSchema = new mongoose.Schema({
	name: {
		type: String,
		required: [true, "Please submit the name"],
	},
	uid: {
		type: String,
		required: true,
		unique: true,
	},
	email: {
		// validation was removed since fastify validates
		// it using schema
		type: String,
		unique: true,
		required: [true, "Please submit an email"],
	},
	provider: {
		// Provider used during sign up
		// This is not updated if the user uses a different
		// oauth provider for sign in
		type: String,
		enum: ["email", ...configs.SUPPORTED_PROVIDERS],
	},
	password: {
		type: String,
		minlength: 8,
		select: false, // this will not be selected in query
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
	loginWithEmailToken: String,
	loginWithEmailTokenExpire: Date,

	// No support as of now

	// isAccountVerified: {
	// 	type: Boolean,
	// 	default: false,
	// },
	// twoFACode: String, // No support as of now
	// twoFAExpire: Date, // No support as of now
	// twoFAEnabled: {
	// 	// No support as of now
	// 	type: Boolean,
	// 	default: false,
	// },

	isDeactivated: {
		type: Boolean,
		default: false,
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
	deactivatedAt: Date,
});

// Function attached to userSchema to get the JWT token
userSchema.methods.getJWT = function () {
	return jwt.sign(
		{
			id: this._id,
			role: this.role,
			name: this.name,
			uid: this.uid,
			isEmailConfirmed: this.isEmailConfirmed,
			// isAccountVerified: this.isAccountVerified,
			isDeactivated: this.isDeactivated,
		},
		configs.JWT_KEY,
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
	return Date.now() >= this.pwResetExpire;
};

userSchema.methods.getEmailConfirmationToken = function () {
	const confirmationToken = crypto.randomBytes(30).toString("hex");

	// Store the hash of the confirmationToken
	this.confirmEmailToken = crypto
		.createHash("sha256")
		.update(confirmationToken)
		.digest("hex");

	// Set token expiration to 1 hour from now
	this.confirmEmailTokenExpire = Date.now() + 60 * 60 * 1000;

	return confirmationToken;
};

userSchema.methods.getLoginEmailToken = function () {
	const loginWithEmailToken = crypto.randomBytes(30).toString("hex");

	// Store the hash of the loginWithEmailToken
	this.loginWithEmailToken = crypto
		.createHash("sha256")
		.update(loginWithEmailToken)
		.digest("hex");

	// Set token expiration to 10 minutes from now
	this.loginWithEmailTokenExpire = Date.now() + 10 * 60 * 1000;

	return loginWithEmailToken;
};

userSchema.methods.isLoginEmailTokenExpired = function () {
	if (!this.loginWithEmailTokenExpire) {
		return true;
	}
	return Date.now() >= this.loginWithEmailTokenExpire;
};

userSchema.methods.isConfirmEmailTokenExpired = function () {
	if (!this.confirmEmailTokenExpire) {
		return true;
	}
	return Date.now() >= this.confirmEmailTokenExpire;
};

// Helper Functions

const User = mongoose.model("User", userSchema);

const hashPasswd = async (passwd) => {
	const salt = await bcrypt.genSalt(10);
	hashedPasswd = await bcrypt.hash(passwd, salt);
	return hashedPasswd;
};

module.exports = {
	User,
	hashPasswd,
};
