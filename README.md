# Simpleauth
Simple authentication service written using fastify + mongodb(mongoose)

## Table of contents
- [Simpleauth](#simpleauth)
  - [Table of contents](#table-of-contents)
  - [Features](#features)
    - [Login with Oauth2 Providers](#login-with-oauth2-providers)
  - [Setting up Locally](#setting-up-locally)
    - [Configuring Environment variables](#configuring-environment-variables)
    - [SMTP Configuration](#smtp-configuration)
    - [Oauth2 Provider Configurations](#oauth2-provider-configurations)
    - [Application configurations](#application-configurations)
  - [Swagger UI documentation](#swagger-ui-documentation)
  - [Dependencies](#dependencies)

## Features
 - [x] Sign up and Login 
 - [x] Email verification
 - [x] Forgot Password
 - [x] Refresh Token Support
 - [x] Swagger UI for development environment

### Login with Oauth2 Providers
- [x] Github
- [x] Google
## Setting up Locally

 - Clone the repository
 - Run `npm install`
 - Configure Environment variables
 -  Run `npm start`
 
### Configuring Environment variables

|Environment variable  |  |Default (If not configured)|
|--|--|--|
|  MONGO_URI | MongoDB URI |-|
| ENVIRONMENT | Product environment |"dev"|
|  CHECK_ADMIN| Checks if admin user exists when signing up |1 (0 to skip check)|
| JWT_KEY |Key used to sign JWT  |-|
| PORT |Application Port  |5000|
| ALLOW_CORS_ORIGIN | Origin for Cors |Disables CORS if its not configured|
|  SEND_NEW_LOGIN_EMAIL| Send email alert if the user is logged in |0 (1 to send)|
### SMTP Configuration
Configurations required to send email
|Environment variable  |
|--|
| SMTP_HOST |  
| SMTP_PORT |  
| SMTP_EMAIL |  
|  SMTP_PASSWORD|  
| FROM_NAME | 
| FROM_EMAIL | 

### Oauth2 Provider Configurations

|Environment variable  | |
|--|--|
| [PROVIDER]_CLIENT_ID | |
| [PROVIDER]_CLIENT_SECRET | | 
| [PROVIDER]_REDIRECT_URI | Frontend URL to which the provider redirects with `code` or error message|




### Application configurations
|  Environment Variable|  |
|--|--|
|APP_NAME  | Application name to be used in emails |
|APP_DOMAIN  |  Frontend host / Application home|
|APP_CONFIRM_EMAIL_REDIRECT  | Frontend URL to which email confirmation is redirected |
| APP_RESET_PASSWORD_REDIRECT |  Frontend URL to which password reset is redirected |

## Swagger UI documentation

> Swagger UI allows anyone — be it your development team or your end consumers — to visualize and interact with the API’s resources without having any of the implementation logic in place. It’s automatically generated from your OpenAPI (formerly known as Swagger) Specification, with the visual documentation making it easy for back end implementation and client side consumption.
https://swagger.io/tools/swagger-ui/

To access API documentation go to `http://localhost:{PORT}/documentation`
## Dependencies

|Library  | Function |
|--|--|
| bcryptjs | Hashing passwords |
|dotenv |Loading environment variables |
| fastify| Fast and low overhead web framework, for Node.js |
|fastify-cors|Add cors support|
|fastify-swagger|Swagger UI|
|axios|Sending requests to oauth resource servers|
|jsonwebtoken|Generate and verify JSON web tokens|
|mongoose|MongoDB ORM|
|mustache|Process HTML templates for emails|
|nodemailer|Send Email|

Email templates from https://github.com/wildbit/postmark-templates
     


