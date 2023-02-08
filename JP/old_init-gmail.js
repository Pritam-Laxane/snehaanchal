const nodemailer = require('nodemailer');
const { google } = require('googleapis');
const logger = require('../helpers/winston');

// These id's and secrets should come from .env file.
const EMAIL_ID = 'nitinbetharia@gmail.com';
const CLIENT_ID = '398497489262-ks7el0qom9fh5puc322rhklgp8jbl5ss.apps.googleusercontent.com';
const CLIENT_SECRET = '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';
const REDIRECT_URI = 'https://developers.google.com/oauthplayground';
const REFRESH_TOKEN = `1//04f9CVsGC3Q8ACgYIARAAGAQSNwF-L9IrzidBt2_YEOQFPUYvdRbQSKvCADGZOdKT7z6HViMjgAfgMLFCPIqh1a2An2Dnde3N0jc`;

const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

async function sendEmails(
  to = 'nitinbetharia@gmail.com',
  cc = '',
  bcc = '',
  subject = 'Test Email',
  body = 'This is Test email from Snehaanchal App.'
) {
  try {
    const accessToken = await new Promise((resolve, reject) => {
      oAuth2Client.getAccessToken((err, token) => {
        if (err) reject('Failed to get Gmail Access Token');
        resolve(token);
      });
    });

    const transport = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: EMAIL_ID,
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        refreshToken: REFRESH_TOKEN,
        accessToken: accessToken,
        rejectUnauthorized: false,
      },
    });

    const mailOptions = {
      from: `Snehaanchal App <${EMAIL_ID}>`,
      to: to,
      cc: cc,
      bcc: bcc,
      subject: subject,
      html: body,
    };
    const result = await transport.sendMail(mailOptions);
    return result;
  } catch (error) {
    logger.error(error);
    return error;
  }
}

module.exports = sendEmails;
