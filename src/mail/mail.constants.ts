// Verification email body
export const verificationEmail = (
  username: string,
  verificationCode: string,
) => {
  return `<html>
          <body>
            <h3>Welcome ${username}!</h3>
            <div>
              <p>Thank you for signing up to use the Nestjs Authentication demo! Please verify your account using the following code:</p>
            </div>
            <div> 
              <p>${verificationCode}</p>
            </div>
          </body>
        </html>`;
};
