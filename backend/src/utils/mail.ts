import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'npkhai2004@gmail.com',
        pass: process.env.GOOGLE_APP_PASSWORD
    }
})

export const exampleUsage = async () => {
    const mailOptions = {
        from: 'npkhai2004@gmail.com',
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
