var nodemailer = require("nodemailer");

var transporter = nodemailer.createTransport({
    service: 'hotmail',
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD 
    }
  });

var welcomeMessage = ({email, name}) => {
    transporter.sendMail( {
        from: process.env.EMAIL,
        to: email,
        subject: 'Welcome!',
        html: "<h1>Welcome to the Task App!</h1><img src='https://media1.tenor.com/images/d187f6cc75de75a9a2dd611a43e1391e/tenor.gif?itemid=15523929'><p>" +
        name + ", that was easy!</p>"
      })
    .then(() => console.log('Done'))
    .catch(error => console.log(error));
};

var closeAccountMessage = ({email, name}) => {
    transporter.sendMail( {
        from: process.env.EMAIL,
        to: email,
        subject: 'Task App',
        text: name + ', we are sorry to hear that you no longer belong to our community. We hope to see you soon in our app.'
      })
    .then(() => console.log('Done'))
    .catch(error => console.log(error));
};

module.exports = {welcomeMessage, closeAccountMessage};