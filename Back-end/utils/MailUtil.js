const mailer = require("nodemailer")

const mailSend = async(to, subject, text) =>{
    const transporter = mailer.createTransport({
        service:"gmail",
        auth:{
            user:process.env.EMAIL_USER,
            pass:process.env.EMAIL_PASSWORD
        }
    })

    const mailOption={
        to:to,
        subject:subject,
        // text:text
        html:text
    }

    const mailResponse = await transporter.sendMail(mailOption)
    console.log(mailResponse)
    return mailResponse

}
module.exports = mailSend