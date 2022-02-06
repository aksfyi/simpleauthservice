const getCommonProperties = (statusCode, successValue) => ({
	statusCode: { type: "integer", example: statusCode },
	message: { type: "string" },
	success: { type: "boolean", example: successValue },
});

const getErrorProperties = (statusCode, successValue) => ({
	...getCommonProperties(statusCode, successValue),
	error: { type: "string" },
});

const getEmailStatusResponse = () => {
	return {
		emailSuccess: { type: "boolean" },
		emailMessage: { type: "string" },
	};
};

const getSuccessObject = (statusCode, successValue, description, props) => ({
	type: "object",
	description,
	properties: { ...getCommonProperties(statusCode, successValue), ...props },
});
const responseErrors = {
	400: {
		description: "Bad Request",
		type: "object",
		properties: getErrorProperties(400, false),
	},
	500: {
		description: "Internal Server Error",
		type: "object",
		properties: getErrorProperties(500, false),
	},
	404: {
		description: "Not found",
		type: "object",
		properties: getErrorProperties(404, false),
	},
	403: {
		description: "Forbidden",
		type: "object",
		properties: getErrorProperties(403, false),
	},
	429: {
		description: "Rate Limit. More than 100 requests per minute",
		type: "object",
		properties: getErrorProperties(429, false),
	},
};

const jwtSecurity = [
	{
		JWTToken: [],
	},
];

module.exports = {
	jwtSecurity,
	responseErrors,
	getSuccessObject,
	getCommonProperties,
	getErrorProperties,
	getEmailStatusResponse,
};
