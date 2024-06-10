const  nodemailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');

const transporter = nodemailer.createTransport(smtpTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port : 465,
  secure: true,
  auth: {
    user: 'mrnobody6222@gmail.com',
    pass: 'Iamcomingharvard????333'
  }
}));

exports.sendOTPEmail = (toEmail , OTP) => {
  var mailOptions = {
    from: 'DocTalker Team ',
    to: toEmail,
    subject: `OTP verification`,
    text: `Your OTP is ' ${OTP} ' . Please do not share this OTP with anyone.\n 
          This OTP will expire in 5 minutes\n\n
          Team Doctalker.
          `
  };

  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
}
