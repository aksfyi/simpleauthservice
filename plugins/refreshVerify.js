const jwt = require("jsonwebtoken");
const { configs } = require("../configs");
const { sendErrorResponse } = require("../utils/responseHelpers");

/**
 * Plugin to verify if the user is refresh JWT token is valid
 * @returns
 */
const verifyRefresh = async (request, reply) => {
	request.log.info(`Verifying If the refresh Token is valid`);
	request.JWT_TYPE = "refresh";

	let token;
	// If refresh token is sent in request body attach it to request object
	// (request.refreshToken) else check cookie and validate the token in the cookie
	// then attach it to request body (request.refreshToken) if the cookie is
	// valid
	let refreshTokenBody = request.body ? request.body.refreshToken : false;
	if (!refreshTokenBody) {
		request.log.info("Refresh Token is in cookie");
		const refreshTokenCookie = request.cookies.refreshToken;
		if (!refreshTokenCookie) {
			return sendErrorResponse(reply, 400, "Missing refresh token in cookie");
		}
		// Fastify-cookie has a function which can be used to sign & unsign tokens
		// unsignCookie returns valid, renew & false
		// valid (boolean) : the cookie has been unsigned successfully
		// renew (boolean) : the cookie has been unsigned with an old secret
		// value (string/null) : if the cookie is valid then returns string else null
		let refreshToken = request.unsignCookie(refreshTokenCookie);

		if (!refreshToken.valid) {
			return sendErrorResponse(reply, 400, "Invalid Refresh Token", {
				clearCookie: true,
			});
		} else {
			token = refreshToken.value;
		}
	} else {
		token = refreshTokenBody;
	}
	request.log.info("Verifying Refresh(JWT) token");
	const decoded = jwt.verify(token, configs.REFRESH_KEY);
	request.rtid = decoded.rtid;
};

module.exports = {
	verifyRefresh,
};
