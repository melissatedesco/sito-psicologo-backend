import nodemailer from 'nodemailer'
import dotenv from 'dotenv'

dotenv.config()

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: Number(process.env.EMAIL_PORT) === 465,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
})

// evita che i dati inseriti dal paziente vengano interpretati come HTML
const escapeHtml = (text) => String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

// da YYYY-MM-DD a DD/MM/YYYY
const formatDate = (dateString) => {
    const [y, m, d] = String(dateString).split('-')
    return `${d}/${m}/${y}`
}

export const sendConfirmationEmail = async (appuntamento) => {
    const { date, startTime, clientName, clientEmail } = appuntamento

    const mailOptions = {
        from: `"Studio Psicologia" <${process.env.EMAIL_USER}>`,
        to: clientEmail,
        subject: 'Conferma Appuntamento - Studio Psicologia',
        html: `
        <h3>Conferma Prenotazione</h3>
        <p>Gentile <strong>${escapeHtml(clientName)}</strong>,</p>
        <p>Il tuo appuntamento è stato confermato per il giorno <strong>${formatDate(date)}</strong>
        alle ore <strong>${escapeHtml(startTime)}</strong>.</p>
        <p>Cordiali saluti,<br>Studio di Psicologia</p>
        `
    }

    return transporter.sendMail(mailOptions)
}
