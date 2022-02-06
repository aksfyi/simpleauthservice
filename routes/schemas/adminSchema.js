const { getSuccessObject, responseErrors, jwtSecurity } = require("./common");
const errors = responseErrors;

const adminSchema = {
	configsGet: {
		description: "Check application configurations",
		tags: ["Admin Routes"],
		security: jwtSecurity,
		response: {
			201: getSuccessObject(200, true, "Success", {}),
			400: errors[404],
			500: errors[500],
			403: errors[403],
			429: errors[429],
		},
	},
};

module.exports = {
	adminSchema,
};
