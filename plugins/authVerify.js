const jwt = require("jsonwebtoken");
const { configs } = require("../configs");
const { sendErrorResponse } = require("../handlers/responseHelpers");

const verifyAuth = (roles = [], emailConfRequired) => {
	return function (request, reply, done) {
		// Get the authorization header
		const authorizationHeader = request.headers["authorization"];

		// If the token is not sent in authorization header send error
		// response
		if (!authorizationHeader) {
			sendErrorResponse(
				reply,
				403,
				"Token in the authorization header missing"
			);
		} else if (!authorizationHeader.startsWith("Bearer ")) {
			// If the header doesnt start with "Bearer " send error response
			// "Bearer" is recommended but not mandatory (RFC)
			sendErrorResponse(
				reply,
				403,
				"Format error . Please send the token as Bearer token"
			);
		} else {
			// Get the token from header
			token = authorizationHeader.substring(7, authorizationHeader.length);

			const decoded = jwt.verify(token, configs.JWT_KEY);

			if (!roles.includes(decoded.role)) {
				// If the user's role is not authorized to access the endpoint send error

				sendErrorResponse(
					reply,
					403,
					"You have no permission to view this page"
				);
			}
			if (emailConfRequired) {
				if (!decoded.isEmailConfirmed) {
					sendErrorResponse(
						reply,
						403,
						"Confirm your email address to view this page"
					);
				}
			}
			request.user = decoded;
			done();
		}
	};
};

module.exports = {
	verifyAuth,
};
