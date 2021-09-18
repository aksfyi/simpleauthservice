const { configs } = require("../../configs");
const crypto = require("crypto");
const { default: axios } = require("axios");

// Class to handle all the functions related to Oauth Provider login
class OauthProviderLogin {
	constructor(provider) {
		this.provider = provider;
	}

	// Function to get the initial login url
	getRedirectUrl = (state) => {
		if (!configs.SUPPORTED_PROVIDERS.includes(this.provider)) {
			return 0;
		}
		switch (this.provider) {
			case configs.PROVIDER_GITHUB:
				const queryParams = [
					`client_id=${configs.GITHUB_CONFIGS.CLIENT_ID}`,
					`redirect_uri=${configs.GITHUB_CONFIGS.REDIRECT_URI}`,
					`scope=${configs.GITHUB_CONFIGS.SCOPE}`,
					`state=${state}`,
				].join("&");
				return `${configs.GITHUB_CONFIGS.AUTHORIZE}?${queryParams}`;
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
				return await getGithubDetails(code);
			default:
				return 0;
		}
	}
}

// Function to get user details from code returned by github
const getGithubDetails = async (code) => {
	const provider = configs.PROVIDER_GITHUB;

	// get access token from code
	const accessTokenResponse = await axios.post(
		configs.GITHUB_CONFIGS.ACCESS_TOKEN,
		{
			client_id: configs.GITHUB_CONFIGS.CLIENT_ID,
			client_secret: configs.GITHUB_CONFIGS.CLIENT_SECRET,
			code: code,
		},
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

	let email, verified;
	let i = 0;

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

module.exports = {
	OauthProviderLogin,
};
