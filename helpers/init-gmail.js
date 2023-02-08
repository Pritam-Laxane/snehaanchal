const nodemailer = require('nodemailer');
const logger = require('../helpers/winston');

// create reusable transporter object using the default SMTP transport
let transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: 'nitinbetharia@gmail.com', // generated ethereal user
    pass: 'cmfbugcyfsjilpgj', // generated ethereal password
  },
});

// send mail with defined transport object
async function sendEmails(mailOptions) {
  // check if mailOptions has all the required property, if not replace with default options
  const defaultOptions = {
    from: 'Snehaanchal App <nitinbetharia@gmail.com>',
    to: 'nitinbetharia@gmail.com',
    cc: '',
    bcc: '',
    subject: 'Email from Snehaanchal App',
    text: 'Default text of email from Snehaanchal App',
  };
  const normalisedEmailOptions = Object.assign({}, defaultOptions, mailOptions);
  normalisedEmailOptions.html = normalisedEmailOptions.text; // copy text to add html option also
  console.log(normalisedEmailOptions);

  transporter.sendMail(normalisedEmailOptions, (error, info) => {
    if (error) {
      return logger.error(error);
    }
    logger.info('Message sent: %s', info.messageId);
    logger.info('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  });
}

module.exports = sendEmails;
