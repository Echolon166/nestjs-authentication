# NestJS Authentication

This project is an example of implementation of a user **email authentication** with [Nestjs](https://nestjs.com/), [Prisma](https://www.prisma.io/nestjs) and [Nodemailer](https://www.nodemailer.com).

## API

Server will listen on port `3000` and it expose the following APIs:

- **POST** - `/user/register` - Register a new user

  - **username** - _string_
  - **email** - _string_

- **GET** - `/user/verify-email/:username/:verificationToken` - Validates the token and activates the user's account

- **GET** - `/user/check-verification/:username` - Checks if the user's account is verified

## Modules

- DatabaseModule: Handles the database connection using Prisma.

- MailModule: Handles sending mails using Nodemailer.

- UserModule: Handles anything related to User.

  - UserController: Responsible for handling incoming HTTP requests and providing responses for user-related endpoints.
  - UserService: Responsible for the business logic related to user management, such as creating users, verifying emails, updating user information.

- AppModule: Root module.

## Development

### Set up Neon as Database

- Sign up to [Neon](https://neon.tech).

- Enter your project name, database name, select your region and click `Create Project`.

![neon_new_prjeoct](https://github.com/Echolon166/nestjs-authentication/assets/36865381/350f2fb8-ac94-40b0-9d93-d6996a8f6280)

- Navigate to `Dashboard`, click `Connection string` and select `Prisma`, then copy `DATABASE_URL` from `.env`.

![neon_dashboard](https://github.com/Echolon166/nestjs-authentication/assets/36865381/971fedce-ca39-4d33-9b14-d9e24e5849b9)

- Paste the `DATABASE_URL` to `.env` in the project.

### Get Gmail app password

- Access Your Google Account:

- Start by visiting the Google Account management page. You can do this by navigating to [myaccount.google.com](https://myaccount.google.com/).

- Sign In: Sign in to the Google Account associated with the Gmail address you want to use for sending emails programmatically.

- Security: In the left sidebar, click on “Security.”

- Scroll down to How you sign in to google and click on 2-step verificaiton.

- App Passwords: Scroll down to “App passwords.” Click on “App passwords.” You may be prompted to re-enter your password for security purposes.

- App name: Enter a custom name for this App Password. It helps you identify it later, so choose something related to the application or use case where you plan to use this App Password.

- Create: Click the “Create” button. Google will create a unique 16-character App Password for your custom application/device.

- Copy the 16-character password to `GOOGLE_MAIL_APP_PASSWORD` field in `.env`.

### Set up your development environment:

- Create a `.env` file using `.env-example` and enter required fields.

- `$ npm install`

- `$ npx prisma generate`

#### Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```
