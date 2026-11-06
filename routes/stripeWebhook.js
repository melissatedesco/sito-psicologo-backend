import express from 'express'
import Stripe from 'stripe'
import Appuntamento from '../models/Appuntamento.js'

const router = express.Router()
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

// stripe chiama questa rotta quando succede qualcosa (es pagamento completato)
//  il corpo deve restare 'raw' per poter verificare la firma
router.post('/webhook', express.raw({type:'application/json'}), async (req, res) => {
    const sig = req.headers['stripe-signature']
    let event 
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET)
    } catch (error) {
        console.error('Firma webhook non valida:', error.message)
        return res.status(400).send(`Webhook Error: ${error.message}`)
    }

    // quando un pagamento è andato a buon fine
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object
        // segna pagato SOLO se il pagamento è davvero completato
        if (session.payment_status !== 'paid') {
            return res.json({ received: true })
        }
        const id = session.metadata?.appuntamentoId
        if (id) {
            try {
                const appuntamento = await Appuntamento.findByPk(id)
                if (appuntamento) {
                    appuntamento.paid = true
                    await appuntamento.save()
                    console.log('Appuntamento', id, 'segnato come pagato (webhook)')
                }
            } catch (error) {
                console.error('Errore aggiornamento pagamento:', error)
                // risposta di errore: così Stripe ritenta l'invio e il pagamento non va perso
                return res.status(500).json({ error: 'Errore aggiornamento pagamento' })
            }
        }
    }
    res.json({received: true})
})

export default router