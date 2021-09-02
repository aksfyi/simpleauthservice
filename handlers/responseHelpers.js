const sendErrorResponse = (reply, statusCode, message, redirectURL) => {
	let error = "Internal Server Error";
	switch (statusCode) {
		case 400:
			error = "Bad Request";
			break;
		case 404:
			error = "Not Found";
			break;
		case 403:
			error = "Forbidden";
			break;
		default:
			break;
	}
	if (!redirectURL) {
		reply.status(statusCode).send({
			statusCode,
			error,
			message,
			success: false,
		});
	} else {
		reply.redirect(
			`${redirectURL}?statusCode=${statusCode}&error=${error}&message=${message}&success=false`
		);
	}
};

const sendSuccessResponse = (reply, response, redirectURL) => {
	if (!redirectURL) {
		reply.code(response.statusCode).send({
			...response,
			success: true,
		});
	} else {
		reply.redirect(
			`${redirectURL}?statusCode=${response.statusCode}&message=${response.message}&success=true`
		);
	}
};

const redirectWithToken = (reply, token, redirectURL) => {
	reply.redirect(`${redirectURL}?token=${token}&success=true`);
};

module.exports = {
	sendErrorResponse,
	sendSuccessResponse,
	redirectWithToken,
};
