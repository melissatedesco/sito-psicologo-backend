import nodemailer from 'nodemailer'

dotenv.config({ override: true, quiet: true })

const transporter = nodemailer.createTransport({
    host: process.env.SMPT_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 587,
    auth: {
        user: process.env.SMPT_USER,
        pass: process.env.SMPT_PASS
    }
})

export const sendConfirmationEmail = async (appuntamento) => {
    // link con cui il paziente gestisce il proprio appuntamento
    const manageUrl = `${ process.env.APP_URL}/api/appuntamento/manage/${appuntamento.manageToken}`

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
        color:#777>
        Non risponda a questa email. Per contatti: info@studio.it
        `
    })

}
