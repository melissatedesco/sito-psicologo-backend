import express from 'express'
import Stripe from 'stripe'
import Appuntamento from '../models/Appuntamento.js'
import { authenticateUser, requireRole } from '../middleware/authMiddleware.js'

const router = express.Router()
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173'

// POST /api/pagamento/:id/link genera un link di pagamento Stripe per un appuntamento
router.post('/pagamento/:id/link', authenticateUser, requireRole('dottore', 'segretaria'), async (req, res) => {
    try {
        const { id } = req.params
        // importo in euro
        const amount = Number(req.body?.amount)

        const appuntamento = await Appuntamento.findByPk(id)
        if (!appuntamento) {
            return res.status(404).json({ error: 'Appuntamento non trovato' })
        }
        if (!Number.isFinite(amount) || amount <= 0) {
            return res.status(400).json({ error: 'Importo non valido' })
        }
        if (appuntamento.paid) {
            return res.status(400).json({ error: 'Appuntamento già pagato' })
        }

        // crea la sessione di pagamento Stripe (checkout)
        const session = await stripe.checkout.sessions.create({
            mode: 'payment',
            line_items: [{
                price_data: {
                    currency: 'eur',
                    product_data: {
                        name: `Seduta del ${appuntamento.date} alle ${appuntamento.startTime}`
                    },
                    // euro in centesimi
                    unit_amount: Math.round(amount * 100)
                },
                quantity: 1,
            }],
            success_url: `${CLIENT_URL}/pagamento-ok`,
            cancel_url: `${CLIENT_URL}/pagamento-annullato`,
            customer_email: appuntamento.clientEmail,
            metadata: {appuntamentoId: String(appuntamento.id)}
        })

        // salvo l'importo sull'appuntamento
        appuntamento.amount= Math.round(amount * 100)
        await appuntamento.save()

        // il link da inviare al paziente
        return res.json({ url: session.url })
    } catch (error) {
        console.error('Errore pagamento:', error)
        return res.status(500).json({ error: 'Errore durante la creazione del link di pagamento' })
    }
})

// PATCH /api/pagamento/:id/paid segna l'appuntamento come pagato (conferma manuale)
router.patch('/pagamento/:id/paid', authenticateUser, requireRole('dottore', 'segretaria'), async (req, res) => {
    try {
        const appuntamento = await Appuntamento.findByPk(req.params.id)
        if (!appuntamento) {
            return res.status(404).json({ error: 'Appuntamento non trovato'})
        }
        appuntamento.paid = true
        await appuntamento.save()
        return res.json({message: 'Segnato come pagato', appuntamento})
    } catch (error) {
        console.error('Errore aggiornamento pagamento:', error)
        return res.status(500).json({error: 'Errore nel server'})
    }
})

export default router
