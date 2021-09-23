const { configs } = require("../../configs");
const { default: axios } = require("axios");

// Class to handle all the functions related to Oauth Provider login
// Returns 0 when the functions cannot get required information
class OauthProviderLogin {
	constructor(provider) {
		this.provider = provider;
	}

	// Function to get the initial login url
	getRedirectUrl = (state) => {
		if (!configs.SUPPORTED_PROVIDERS.includes(this.provider)) {
			return 0;
		}

		let queryParams;
		switch (this.provider) {
			// Build queryparams and redirect URI based on the provider
			case configs.PROVIDER_GITHUB:
				queryParams = [
					`client_id=${configs.GITHUB_CONFIGS.CLIENT_ID}`,
					`redirect_uri=${configs.GITHUB_CONFIGS.REDIRECT_URI}`,
					`scope=${configs.GITHUB_CONFIGS.SCOPE}`,
					`state=${state}`,
				].join("&");
				return `${configs.GITHUB_CONFIGS.AUTHORIZE}?${queryParams}`;
			case configs.PROVIDER_GOOGLE:
				queryParams = [
					`client_id=${configs.GOOGLE_CONFIGS.CLIENT_ID}`,
					`redirect_uri=${configs.GOOGLE_CONFIGS.REDIRECT_URI}`,
					`scope=${configs.GOOGLE_CONFIGS.SCOPE}`,
					`state=${state}`,
					`response_type=code`,
				].join("&");
				return `${configs.GOOGLE_CONFIGS.AUTHORIZE}?${queryParams}`;
			default:
				return 0;
		}
	};

	// function to get name and email, and if the email is verified
	async getUserDetails(code) {
		if (!code) {
			return 0;
		}
		switch (this.provider) {
			case configs.PROVIDER_GITHUB:
				return await getDetailsGithub(code);
			case configs.PROVIDER_GOOGLE:
				return await getDetailsGoogle(code);
			default:
				return 0;
		}
	}
}

// Function to get user details from code returned by github
const getDetailsGithub = async (code) => {
	const provider = configs.PROVIDER_GITHUB;

	let email, verified;

	// Iterator for email
	let i = 0;

	// Request body for access token request
	const requestBody = {
		client_id: configs.GITHUB_CONFIGS.CLIENT_ID,
		client_secret: configs.GITHUB_CONFIGS.CLIENT_SECRET,
		code: code,
	};

	// get access token from code
	const accessTokenResponse = await axios.post(
		configs.GITHUB_CONFIGS.ACCESS_TOKEN,
		requestBody,
		{
			headers: {
				Accept: "application/json",
			},
		}
	);
	if (accessTokenResponse.data.error) {
		return {
			error: accessTokenResponse.data.error_description,
		};
	}

	const accessToken = accessTokenResponse.data.access_token;

	// Get profile information from access token
	const profileResponse = await axios.get("https://api.github.com/user", {
		headers: {
			Authorization: `token ${accessToken}`,
		},
	});

	// Get user emails from access token
	const emailResponse = await axios.get("https://api.github.com/user/emails", {
		headers: {
			Authorization: `token ${accessToken}`,
		},
	});

	const { name } = profileResponse.data;
	const emailList = emailResponse.data;

	// Find primary email from the list of emails
	for (i = 0; i < emailList.length; i++) {
		if (emailList[i]["primary"]) break;
	}

	// Return information if it finds valid user details
	if (emailList[i]["primary"] && emailList[i]["email"]) {
		email = emailList[i]["email"];
		verified = emailList[i]["verified"];
		return {
			name,
			email,
			provider,
			verified,
		};
	}
	return 0;
};

// Function to get user details from code returned by google
const getDetailsGoogle = async (code) => {
	const provider = configs.PROVIDER_GOOGLE;

	let email, verified;

	// Iterator for email
	let i = 0;

	// Request body for access token request
	const requestBody = {
		grant_type: "authorization_code",
		client_id: configs.GOOGLE_CONFIGS.CLIENT_ID,
		client_secret: configs.GOOGLE_CONFIGS.CLIENT_SECRET,
		code: code,
		redirect_uri: configs.GOOGLE_CONFIGS.REDIRECT_URI,
	};

	// get Access token from code
	const accessTokenResponse = await axios.post(
		configs.GOOGLE_CONFIGS.ACCESS_TOKEN,
		requestBody
	);

	const accessToken = accessTokenResponse.data.access_token;

	const resourceResponse = await axios.get(
		"https://people.googleapis.com/v1/people/me\
		?requestMask.includeField=person.emailAddresses%2Cperson.names",
		{
			headers: {
				Authorization: `Bearer ${accessToken}`,
				Accept: "application/json",
			},
		}
	);

	let name = resourceResponse.data.names[0]["displayName"];
	const emailList = resourceResponse.data.emailAddresses;

	// Find primary email from the list of emails
	for (i = 0; i < emailList.length; i++) {
		if (emailList[i]["metadata"]["primary"]) break;
	}

	// Return information if it finds valid user details
	if (emailList[i]["metadata"]["primary"] && emailList[i]["value"]) {
		email = emailList[i]["value"];
		verified = emailList[i]["metadata"]["verified"];
		return {
			name,
			email,
			provider,
			verified,
		};
	}
	return 0;
};

module.exports = {
	OauthProviderLogin,
};
