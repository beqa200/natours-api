import nodemailer from "nodemailer";

interface OptionsType {
    email: string,
    subject: string,
    message: string

}
const sendEmail = async(options: OptionsType) => {
    // 1) Create a trasporter
    const transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
        
    })

    // 2) Define the email options
    const mailOptions = {
        from: "Beka Maisuradze <beqmaisuradze912@gmail.com>",
        to: options.email ,
        subject: options.subject,
        text: options.message
    }
    // 3) Send email
    await transporter.sendMail(mailOptions)
}

export default sendEmail;