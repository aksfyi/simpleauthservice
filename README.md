# Simple Auth Service [UNDER DEVELOPMENT]

Simple authentication service written using fastify + mongodb(mongoose)

## Table of contents

- [Simple Auth Service [UNDER DEVELOPMENT]](#simple-auth-service-under-development)
  - [Table of contents](#table-of-contents)
  - [Features](#features)
    - [Login with Oauth2 Providers](#login-with-oauth2-providers)
  - [Setting up Locally](#setting-up-locally)
    - [Configuring Environment variables](#configuring-environment-variables)
    - [SMTP Configuration](#smtp-configuration)
    - [Configuring Captcha verification](#configuring-captcha-verification)
    - [Oauth2 Provider Configurations](#oauth2-provider-configurations)
    - [Application configurations](#application-configurations)
  - [Swagger UI documentation](#swagger-ui-documentation)
  - [Dependencies](#dependencies)

## Features

- [x] Sign up and Login
- [x] Login with email
- [x] Email verification
- [x] Forgot Password
- [x] Refresh Token Support
- [x] hCaptcha Verification Support
- [x] Swagger UI for development environment

### Login with Oauth2 Providers

- [x] Github
- [x] Google

## Setting up Locally

- Clone the repository
- Run `npm install`
- Configure Environment variables
- Run `npm start`

### Configuring Environment variables

| Environment variable                       |                                                                                                                                                                           | Default (If not configured)                                          |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| MONGO_URI                                  | MongoDB URI                                                                                                                                                               | -                                                                    |
| ENVIRONMENT                                | Product environment                                                                                                                                                       | `keywords.DEVELOPMENT_ENV` . Check `configs.js`                      |
| CHECK_ADMIN                                | Checks if admin user exists when signing up                                                                                                                               | 1 (0 to skip check)                                                  |
| JWT_KEY                                    | Key used to sign JWT                                                                                                                                                      | -                                                                    |
| REFRESH_KEY                                | Key used to sign refresh token                                                                                                                                            | -                                                                    |
| PORT                                       | Application Port                                                                                                                                                          | 5000                                                                 |
| ALLOW_CORS_ORIGIN                          | Origin for Cors                                                                                                                                                           | Disables CORS if its not configured                                  |
| DISABLE_MAIL                               | Setting it to 1 , disables sending emails                                                                                                                                 | -                                                                    |
| HTTP_PROTOCOL                              | http or https                                                                                                                                                             | `request.protocol`                                                   |
| PROVIDER_LOGIN_EMAIL_CONFIRMATION_REQUIRED | Email confirmation required if the email is not verified in oauth provider account                                                                                        | true (0 to disable)                                                  |
| SEND_NEW_LOGIN_EMAIL                       | Send email alert if the user is logged in                                                                                                                                 | 0 (1 to send)                                                        |
| HOST                                       | Fastify will run on 127.0.0.1 if HOST not set.Set this to 0.0.0.0 when deploying using docker.Check https://www.fastify.io/docs/latest/Getting-Started/#your-first-server | Fastify will run the application in localhost (127.0.0.1) by default |
| DISABLE_EMAIL_LOGIN                        | "1" to enable login with only oauth providers                                                                                                                             | false                                                                |

### SMTP Configuration

Configurations required to send email
| Environment variable |
| -------------------- |
| SMTP_HOST            |
| SMTP_PORT            |
| SMTP_EMAIL           |
| SMTP_PASSWORD        |
| FROM_NAME            |
| FROM_EMAIL           |

### Configuring Captcha verification

| Environment variable |                                                 |
| -------------------- | ----------------------------------------------- |
| HCAPTCHA_SECRET      | Check https://docs.hcaptcha.com/                |
| DISABLE_CAPTCHA      | Setting it to 1 , disables captcha verification |

### Oauth2 Provider Configurations

| Environment variable      |                                                                           |
| ------------------------- | ------------------------------------------------------------------------- |
| [PROVIDER]\_CLIENT_ID     |                                                                           |
| [PROVIDER]\_CLIENT_SECRET |                                                                           |
| [PROVIDER]\_REDIRECT_URI  | Frontend URL to which the provider redirects with `code` or error message |

### Application configurations

| Environment Variable         |                                                        |
| ---------------------------- | ------------------------------------------------------ |
| APP_NAME                     | Application name to be used in emails                  |
| APP_DOMAIN                   | Frontend host / Application home                       |
| APP_CONFIRM_EMAIL_REDIRECT   | Frontend URL to which email confirmation is redirected |
| APP_RESET_PASSWORD_REDIRECT  | Frontend URL to which password reset is redirected     |
| APP_LOGIN_WTH_EMAIL_REDIRECT | Frontend URL to which login with email is redirected   |

## Swagger UI documentation

> Swagger UI allows anyone — be it your development team or your end consumers — to visualize and interact with the API’s resources without having any of the implementation logic in place. It’s automatically generated from your OpenAPI (formerly known as Swagger) Specification, with the visual documentation making it easy for back end implementation and client side consumption.
> https://swagger.io/tools/swagger-ui/

To access API documentation go to `http://localhost:{PORT}/documentation`

## Dependencies

| Library            | Function                                                                    |
| ------------------ | --------------------------------------------------------------------------- |
| bcryptjs           | Hashing passwords                                                           |
| dotenv             | Loading environment variables                                               |
| fastify            | Fast and low overhead web framework, for Node.js                            |
| fastify-cors       | Add cors support                                                            |
| fastify-swagger    | Swagger UI                                                                  |
| fastify-cookie     | A plugin for Fastify that adds support for reading and setting cookies.     |
| fastify-helmet     | Important security headers for Fastify. It is a tiny wrapper around helmet. |
| fastify-rate-limit | Rate Limiting                                                               |
| fastify-csrf       | Csrf protection                                                             |
| axios              | Sending requests to oauth resource servers                                  |
| jsonwebtoken       | Generate and verify JSON web tokens                                         |
| mongoose           | MongoDB ORM                                                                 |
| mustache           | Process HTML templates for emails                                           |
| nodemailer         | Send Email                                                                  |
| node-cron          | Run Cron Jobs                                                               |

Email templates from https://github.com/wildbit/postmark-templates
