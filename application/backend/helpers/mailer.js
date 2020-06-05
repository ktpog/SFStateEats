const nodemailer = require("nodemailer");

const transport = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  auth: {
    user: "johnmailchimp1000@gmail.com",
    pass: "Mailchimp1000"
  }
});

// const mailOptions = {
//   from: '"Your Emial" <from@example.com>',
//   to: "johnphamdeveloper@gmail.com, johnphamdeveloper@hotmail.com",
//   subject: "Nice Nodemailer test",
//   text: "Hey there, it’s our first message sent with Nodemailer ;) ",
//   html: "<b>Hey there! </b><br> This is our first message sent with Nodemailer"
// };

const sendEmailAccountUnlock = address => {
  const mailOptions = {
    from: '"Email Unlock" <from@example.com>',
    to: address,
    subject: "Update Password",
    text: "",
    html: "<b>Hey there!</b><br> Here is your"
  };

  transport.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error);
    }
    console.log("Message sent: %s", info.messageId);
  });
};

const sendEmailChangePassword = async (address, url) => {
  const mailOptions = {
    from: '"Change Password" <from@example.com>',
    to: address,
    subject: "Update Password",
    text: "",
    html: `<b>Hey there! </b><br> Here is your change password URL: ${url}`
  };

  transport.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
      return Promise.reject(error);
    }
    console.log("Message sent: %s", info.messageId);
    return Promise.resolve("Message sent: %s", info.messageId);
  });
};

module.exports = {
  sendEmailChangePassword,
  sendEmailAccountUnlock
};
