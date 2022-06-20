const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_Key);

const sendWelcomeEmail = async (email, name) => {
  const msg = {
    to: email,
    from: "sine@mead.io",
    subject: "Thanks for joining in!",
    text: `Welcome to the App, ${name}.`,
  };
  try {
    await sgMail.send(msg);
  } catch (error) {
    console.error(error);
    if (error.response) {
      console.error(error.response.body);
    }
  }
};

const sendCancelationEmail = async (email, name) => {
  const msg = {
    to: email,
    from: "sine@mead.io",
    subject: "Sorry to see you go.",
    text: `Good Bye, ${name}.`,
  };
  try {
    await sgMail.send(msg);
  } catch (error) {
    console.error(error);
    if (error.response) {
      console.error(error.response.body);
    }
  }
};

module.exports = {
  sendWelcomeEmail,
  sendCancelationEmail,
};
