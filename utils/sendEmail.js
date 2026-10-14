import nodemailer from 'nodemailer'
import dotenv from 'dotenv'
dotenv.config({ override: true, quiet: true })

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
})

export const sendConfirmationEmail = async (appuntamento) => {
    // link con cui il paziente gestisce il proprio appuntamento
    const manageUrl = `${process.env.APP_URL}/api/manage/${appuntamento.manageToken}`

    await transporter.sendMail({
        from: process.env.MAIL_FROM,
        to: appuntamento.clientEmail,
        subject: 'Conferma Appuntamento - Studio Psicologia',
        html: `
        <h3>Conferma Prenotazione</h3>
        <p>Gentile ${appuntamento.clientName},</p>
        <p>Il tuo appuntamento è stato confermato per il giorno 
        <strong>${appuntamento.date}</strong>
        alle <strong>${appuntamento.startTime}</strong>.</p>
        <p>Per vedere o disdire l'appuntamento usi questo link personale:</p>
        <p><a href="${manageUrl}">${manageUrl}</a></p>
        <hr>
        <p style="font-size:12px;
        color:#777">
        Non risponda a questa email. Per contatti: info@studio.it
        `
    })
}

export const sendContactEmail = async ({name, email, message}) => {
    await transporter.sendMail({
        // dove arriva il messaggio
        to: process.env.CONTACT_TO || 'info@studio.it',
        // rispondi al visitatore 
        replyTo: email,
        subject: `Nuovo messaggio dal sito - ${name}`,
        html: `
        <h3>Nuovo messaggio dal modulo contatti</h3>
        <p><strong>Nome:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Messaggio:</strong></p>
        <p>${message}</p>
        `
    })
}
