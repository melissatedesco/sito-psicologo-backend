import { SCHEDULE_CONFIG } from '../config/schedule.js'

// controlla che la stringa sia una data reale nel formato YYYY-MM-DD
export const isValidDateString = (dateString) => {
    if (typeof dateString !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        return false
    }
    const date = new Date(`${dateString}T00:00:00Z`)
    return !isNaN(date) && date.toISOString().slice(0, 10) === dateString
}

export const calculateAvailableSlots = (dateString, bookedAppuntamenti = []) => {
    if (!isValidDateString(dateString)) {
        return []
    }

    // si usa UTC per evitare che il fuso orario del server sposti il giorno
    const dayOfWeek = new Date(`${dateString}T00:00:00Z`).getUTCDay()

    // verifica se il giorno è lavorativo
    if (!SCHEDULE_CONFIG.workingDays.includes(dayOfWeek)) {
        return []
    }

    const bookedTimes = bookedAppuntamenti.map(app => app.startTime)
    const slots = []

    const [startH, startM] = SCHEDULE_CONFIG.startHour.split(':').map(Number)
    const [endH, endM] = SCHEDULE_CONFIG.endHour.split(':').map(Number)

    let currentMinutes = startH * 60 + startM
    const endLimitMinutes = endH * 60 + endM

    // calcola gli slot entro l'orario di chiusura
    while (currentMinutes + SCHEDULE_CONFIG.slotDurationMinutes <= endLimitMinutes) {
        const hh = String(Math.floor(currentMinutes / 60)).padStart(2, '0')
        const mm = String(currentMinutes % 60).padStart(2, '0')
        const timeSlot = `${hh}:${mm}`

        if (!bookedTimes.includes(timeSlot)) {
            slots.push(timeSlot)
        }

        currentMinutes += SCHEDULE_CONFIG.slotDurationMinutes
    }
    return slots
}
