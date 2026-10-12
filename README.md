# Sito Psicologo – Backend

API REST per la gestione degli appuntamenti di uno studio di psicologia.
I pazienti prenotano senza account e ricevono un'email con un link personale per vedere o disdire l'appuntamento; lo staff (admin, dottore, segretaria) accede con login e gestisce l'agenda.

## Tecnologie

- **Node.js** + **Express 5** (ES modules)
- **MySQL** (es. MAMP) con **Sequelize**
- **JWT** per l'autenticazione dello staff, **bcrypt** per le password
- **Nodemailer** per le email di conferma

## Requisiti

- Node.js 18 o superiore
- Un database MySQL attivo (con MAMP: host `localhost`, porta `3306` o `8889`)
- Un account SMTP per l'invio delle email (es. Gmail con password per le app)

## Installazione

```bash
git clone https://github.com/melissatedesco/sito-psicologo-backend.git
cd sito-psicologo-backend
npm install
```

Crea il database vuoto in MySQL (le tabelle vengono create in automatico all'avvio):

```sql
CREATE DATABASE studio_psicologia;
```

Copia `.env.example` in `.env` e compila i valori (vedi sotto).

## Variabili d'ambiente

| Variabile | Descrizione | Esempio |
|---|---|---|
| `PORT` | Porta del server | `5000` |
| `CLIENT_URL` | URL del frontend | `http://localhost:5173` |
| `DB_HOST` | Host MySQL | `localhost` |
| `DB_PORT` | Porta MySQL | `3306` |
| `DB_NAME` | Nome del database | `studio_psicologia` |
| `DB_USER` | Utente MySQL | `root` |
| `DB_PASS` | Password MySQL | `root` |
| `JWT_SECRET` | Chiave per firmare i token (lunga e casuale) | |
| `SMTP_HOST` | Server SMTP | `smtp.gmail.com` |
| `SMTP_PORT` | Porta SMTP | `587` |
| `SMTP_USER` | Utente SMTP | |
| `SMTP_PASS` | Password SMTP | |
| `MAIL_FROM` | Mittente delle email | `"Studio" <info@studio.it>` |
| `APP_URL` | URL pubblico del backend, usato nel link dell'email | `http://localhost:5000` |
| `ADMIN_EMAIL` | Email del primo admin (solo per il seed) | |
| `ADMIN_USERNAME` | Username del primo admin (solo per il seed) | `admin` |
| `ADMIN_PASSWORD` | Password del primo admin (solo per il seed) | |

## Avvio

```bash
npm run seed   # crea il primo account admin (una sola volta)
npm run dev    # avvio in sviluppo con nodemon
npm start      # avvio normale
```

Per verificare che il server risponda: `GET /api/health` → `{ "ok": true }`.

## Orari degli appuntamenti

Configurati in [config/schedule.js](config/schedule.js):

- giorni lavorativi: lunedì–venerdì
- orario: 09:00–19:30
- durata di ogni slot: 60 minuti (l'ultimo slot prenotabile è alle 18:00)

## API

Le rotte protette richiedono l'header `Authorization: Bearer <token>`, ottenuto dal login. Il token dura 8 ore.

### Autenticazione – `/api/auth`

| Metodo | Rotta | Accesso | Descrizione |
|---|---|---|---|
| POST | `/login` | pubblico | Body: `{ identifier, password }` (identifier = username o email). Restituisce `token` e dati utente |
| POST | `/register` | staff loggato | Body: `{ email, username, password, role }`. L'admin crea dottori e segretarie, il dottore crea solo segretarie |
| POST | `/logout` | staff loggato | Conferma il logout (il token va eliminato lato client) |

### Appuntamenti – `/api`

| Metodo | Rotta | Accesso | Descrizione |
|---|---|---|---|
| GET | `/available-slots?date=YYYY-MM-DD` | pubblico | Orari liberi per una data |
| POST | `/book` | pubblico | Prenota. Body: `{ date, startTime, clientName, clientEmail, clientPhone, notes? }`. Invia l'email di conferma |
| GET | `/manage/:token` | paziente (link email) | Dettagli dell'appuntamento |
| DELETE | `/manage/:token` | paziente (link email) | Disdice l'appuntamento |
| GET | `/` | dottore, segretaria | Elenco di tutti gli appuntamenti |
| PUT | `/:id` | dottore, segretaria | Modifica l'appuntamento; se cambiano data o ora controlla che il nuovo slot sia libero (409 se occupato) |
| DELETE | `/:id` | dottore, segretaria | Elimina l'appuntamento |

## Ruoli dello staff

| Ruolo | Può creare account | Gestisce appuntamenti |
|---|---|---|
| `admin` | dottore, segretaria | no |
| `dottore` | segretaria | sì |
| `segretaria` | nessuno | sì |

## Struttura del progetto

```
config/       orari dello studio
middleware/   verifica del token JWT e dei ruoli
models/       modelli Sequelize (Staff, Appuntamento)
routes/       rotte di autenticazione e appuntamenti
scripts/      seed dell'account admin
utils/        calcolo degli slot e invio email
db.js         connessione al database
server.js     avvio del server
```
