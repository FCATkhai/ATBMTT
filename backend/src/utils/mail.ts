import nodemailer from 'nodemailer'
import dotenv from 'dotenv'

dotenv.config()

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.SECRET_GMAIL,
        pass: process.env.SECRET_GMAIL_PASS
    }
})

export const exampleUsage = async () => {
    const mailOptions = {
        from: 'dravence4@gmail.com',
        to: 'khaib2207531@student.ctu.edu.vn',
        subject: 'Test Email',
        text: 'This is a test email sent from Node.js using Nodemailer!'
    }
    try {
        const info = await transporter.sendMail(mailOptions)
        console.log('Email sent: ' + info.response)
    } catch (error) {
        console.error('Error sending email: ', error)
    }
}

export default transporter
