const nodemailer = require('nodemailer');
const pug = require('pug') ; 
const { convert } = require('html-to-text');



module.exports = class Email {
  constructor (user , url) {
    this.to =  user.email ; 
    this.firstName = user.name.split(' ')[0] ; 
    this.url = url ; 
    this.form = `Escapes Staff <${process.env.EMAIL_FROM}>` ;
  }
  newTransport () {
    if (process.env.NODE_ENV === 'production') {
      // sendgrid
      return 1 ; 
    }
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      }
    })
  }
  async send(template , subject) {
      //  render html pug template 

      const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug` , {
        firstName : this.firstName , 
        url : this.url , 
        subject
      }) ; 


      // define the email options 
      const mailOptions = {
        from: this.from , 
        to: this.to ,
        subject,
        html,
        text: convert(html)
      };

      //  create transport and send email : 
      await this.newTransport().sendMail(mailOptions);
      



  }
  async sendWelcome(){
    await this.send('welcome', 'welcome to escapes family ! '); 
  }
  async sendResetPassword(){
    await this.send('passwordReset', 'your password reset token is valid for only 10 minutes') ; 
  }
}



