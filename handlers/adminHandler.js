const { checkConfigs } = require("../configs");
const { sendSuccessResponse } = require("../utils/responseHelpers");

// @route	POST /api/v1/admin/configs
// @desc	Check application configurations
// @access	Private [admin only]
const getConfigs = (request, reply) => {
	return sendSuccessResponse(reply, {
		statusCode: 200,
		message: "Success",
		...checkConfigs,
	});
};

module.exports = {
	getConfigs,
};
