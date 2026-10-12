# Sito Psicologo — Backend

Backend per il sito di uno studio di psicologia: prenotazione appuntamenti
lato paziente e gestione lato staff con ruoli.

## Stack
- Node.js + Express 5 (ES modules)
- Sequelize + MySQL (MAMP)
- Autenticazione JWT, password con bcrypt
- Email con Nodemailer

## Struttura
sito-psicologo-backend/
├── server.js                 # avvio, connessione DB, montaggio route
├── db.js                     # istanza Sequelize
├── scripts/
│   └── seedAdmin.js          # crea il primo Admin (una tantum)
├── config/
│   └── schedule.js           # giorni/orari/durata slot
├── models/
│   ├── Staff.js              # account staff (hash password + checkPassword)
│   └── Appuntamento.js       # appuntamenti (manageToken, indice unique)
├── utils/
│   ├── slotCalculator.js     # validazione data + calcolo slot liberi
│   └── sendEmail.js          # email di conferma
├── middleware/
│   └── authMiddleware.js     # authenticateUser + requireRole
└── routes/
    ├── authRoutes.js         # register, login, logout
    └── appuntamentoRoutes.js # slot, prenotazione, gestione, CRUD staff

## Ruoli e permessi
| Funzionalità                         | Paziente (token) | Segretaria | Dottore | Admin |
|--------------------------------------|:----------------:|:----------:|:-------:|:-----:|
| Prenotare                            | ✅               | ✅         | ✅      | ❌    |
| Vedere/disdire il proprio (link)     | ✅               | ❌         | ❌      | ❌    |
| Vedere/modificare/eliminare tutti    | ❌               | ✅         | ✅      | ❌    |
| Creare account staff                 | ❌               | ❌         | ✅      | ✅    |
| Configurazione sistema / account     | ❌               | ❌         | ❌      | ✅    |

Il paziente non ha account: è identificato dal `manageToken` del singolo
appuntamento. Lo staff accede con login (JWT) e campo `role`.


## Endpoint

### Auth — /api/auth
- `POST /register`  (loggato) crea account staff
- `POST /login`     { identifier, password } → token
- `POST /logout`    (loggato) simbolico, il token si elimina lato client

### Appuntamenti — /api
Pubblici (paziente):
- `GET  /available-slots?date=YYYY-MM-DD`  slot liberi
- `POST /book`                              prenota + invia email
- `GET  /manage/:token`                     vede il proprio appuntamento
- `DELETE /manage/:token`                   disdice il proprio appuntamento

Staff (dottore, segretaria):
- `GET    /`       lista appuntamenti
- `PUT    /:id`    modifica (rivalida lo slot se cambia data/ora)
- `DELETE /:id`    elimina

Utility:
- `GET /api/health` → { ok: true }

## Configurazione (.env)
DB_HOST=127.0.0.1
DB_PORT=8889            # 8889 Mac / 3306 Windows
DB_NAME=studio_psicologo
DB_USER=root
DB_PASS=root
PORT=5000
JWT_SECRET=stringa-lunga-e-casuale
ADMIN_EMAIL=admin@studio.it
ADMIN_USERNAME=admin
ADMIN_PASSWORD=UnaPasswordForte123
SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=...
SMTP_PASS=...
MAIL_FROM="Studio Psicologia <no-reply@studio.it>"
APP_URL=http://localhost:5000

## Avvio
1. Accendi MAMP e crea il database `studio_psicologo` in phpMyAdmin
2. `npm install`
3. Compila il file `.env`
4. `npm run seed`   # crea il primo Admin
5. `npm run dev`    # avvia il server
