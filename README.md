# Casa in Montagna - Sistema di Gestione Prenotazioni

Sistema completo per gestire le prenotazioni di una casa condivisa tra familiari, con calendario visuale e notifiche email.

## Tecnologie Utilizzate

### Backend
- **ASP.NET Core 9.0** - Framework web API
- **Entity Framework Core** - ORM per il database
- **SQLite** - Database leggero e senza configurazione
- **JWT (JSON Web Tokens)** - Autenticazione sicura
- **MailKit** - Invio notifiche email

### Frontend
- **React 18** - Libreria UI
- **Vite** - Build tool veloce
- **React Router** - Gestione routing
- **React Calendar** - Calendario visuale interattivo
- **Axios** - Client HTTP per chiamate API

## Funzionalità

- **Autenticazione Utenti**: Registrazione e login con JWT
- **Calendario Visuale**: Vista mensile delle prenotazioni con colori diversi per le proprie prenotazioni e quelle degli altri
- **Gestione Prenotazioni**: Crea, visualizza ed elimina prenotazioni
- **Validazione Date**: Controllo automatico sovrapposizioni
- **Note**: Possibilità di aggiungere note alle prenotazioni
- **Notifiche Email**: Email automatiche agli altri utenti quando viene creata una prenotazione
- **Design Responsivo**: Interfaccia adattabile per desktop e mobile

## Prerequisiti

- [.NET 9.0 SDK](https://dotnet.microsoft.com/download)
- [Node.js 18+](https://nodejs.org/)
- Un account email (Gmail consigliato) per le notifiche

## Installazione e Avvio

### 1. Backend (ASP.NET Core)

```bash
# Entrare nella cartella Backend
cd Backend

# Ripristinare le dipendenze (già fatto durante la creazione, ma per sicurezza)
dotnet restore

# Avviare il server (di default su http://localhost:5187)
dotnet run
```

Il backend sarà disponibile su `http://localhost:5187`

### 2. Frontend (React)

```bash
# Aprire un nuovo terminale ed entrare nella cartella Frontend
cd Frontend

# Installare le dipendenze (già fatto, ma per sicurezza)
npm install

# Avviare il server di sviluppo (di default su http://localhost:5173)
npm run dev
```

Il frontend sarà disponibile su `http://localhost:5173`

## Configurazione

### Configurazione Backend

Modifica il file `Backend/appsettings.json`:

#### 1. Database SQLite
Il database viene creato automaticamente al primo avvio in `Backend/casa_prenotazioni.db`

#### 2. JWT Secret Key
Per produzione, cambia la chiave segreta:
```json
"JwtSettings": {
  "SecretKey": "LA_TUA_CHIAVE_SEGRETA_MOLTO_LUNGA_E_SICURA",
  "Issuer": "CasaPrenotazioniAPI",
  "Audience": "CasaPrenotazioniClient",
  "ExpirationHours": 24
}
```

#### 3. Email (Notifiche)
Configura le impostazioni email per ricevere notifiche:

**Per Gmail:**
1. Vai su [Google Account Security](https://myaccount.google.com/security)
2. Abilita la "Verifica in due passaggi"
3. Vai su "Password per le app" e genera una nuova password
4. Usa quella password nel file di configurazione:

```json
"EmailSettings": {
  "SmtpServer": "smtp.gmail.com",
  "SmtpPort": 587,
  "SenderEmail": "tuaemail@gmail.com",
  "SenderName": "Casa Prenotazioni",
  "Username": "tuaemail@gmail.com",
  "Password": "la_password_generata_dalle_app"
}
```

**Per altri provider:**
- Outlook/Hotmail: `smtp.office365.com` porta 587
- Yahoo: `smtp.mail.yahoo.com` porta 587

### Configurazione Frontend

Se il backend non è su `http://localhost:5187`, modifica `Frontend/src/services/api.js`:

```javascript
const API_BASE_URL = 'http://tuo-server:porta/api';
```

## Primo Utilizzo

1. Avvia prima il **Backend**, poi il **Frontend**
2. Apri il browser su `http://localhost:5173`
3. Clicca su "Registrati" e crea il primo account
4. Accedi con le credenziali appena create
5. Inizia a creare prenotazioni usando il calendario!

## Struttura del Progetto

```
SitoPadolina/
├── Backend/
│   ├── Controllers/         # API Controllers (Auth, Bookings)
│   ├── Data/               # DbContext per Entity Framework
│   ├── DTOs/               # Data Transfer Objects
│   ├── Models/             # Modelli del database (User, Booking)
│   ├── Services/           # Servizi (Auth, Email)
│   ├── Program.cs          # Configurazione applicazione
│   └── appsettings.json    # Configurazioni
│
├── Frontend/
│   ├── src/
│   │   ├── components/     # Componenti React riutilizzabili
│   │   ├── contexts/       # Context API (AuthContext)
│   │   ├── pages/          # Pagine (Login, Register, Dashboard)
│   │   ├── services/       # Servizi API
│   │   ├── App.jsx         # Componente principale con routing
│   │   └── main.jsx        # Entry point
│   └── package.json
│
└── README.md
```

## API Endpoints

### Autenticazione
- `POST /api/auth/register` - Registrazione nuovo utente
- `POST /api/auth/login` - Login utente

### Prenotazioni (Autenticazione richiesta)
- `GET /api/bookings` - Ottieni tutte le prenotazioni
- `GET /api/bookings/{id}` - Ottieni una prenotazione specifica
- `GET /api/bookings/my` - Ottieni le mie prenotazioni
- `POST /api/bookings` - Crea nuova prenotazione
- `PUT /api/bookings/{id}` - Modifica prenotazione
- `DELETE /api/bookings/{id}` - Elimina prenotazione
- `GET /api/bookings/check-availability` - Verifica disponibilità date

## Deployment

### 🚀 Deploy Online (Gratuito - Railway + Vercel)

Per pubblicare il sito online gratuitamente e condividerlo con amici/famiglia:

**📖 Leggi la guida completa: [DEPLOYMENT.md](DEPLOYMENT.md)**

**Riassunto veloce:**
1. Carica il codice su GitHub
2. Deploy Backend su Railway (https://railway.app)
3. Deploy Frontend su Vercel (https://vercel.com)
4. Configura le variabili d'ambiente
5. Condividi l'URL Vercel con la famiglia!

**Totale costo: 0€ al mese** ✅

### Opzione 2: Hosting Locale (LAN)

Il setup attuale è perfetto per uso locale. Basta:
1. Avviare il backend e frontend sulla tua macchina
2. Gli altri utenti sulla stessa rete possono accedere usando il tuo IP locale
3. Aggiorna `Frontend/src/services/api.js` con `http://TUO-IP:5187/api`

## Troubleshooting

### Porta già in uso
Se la porta 5000 è occupata, modifica `Backend/Properties/launchSettings.json`

### CORS Errors
Verifica che l'URL del frontend sia nella lista CORS in `Backend/Program.cs`

### Email non inviate
- Controlla le credenziali email in `appsettings.json`
- Verifica di aver abilitato l'accesso app nel tuo provider email
- Controlla i log del backend per errori specifici

### Database non creato
Il database SQLite viene creato automaticamente al primo avvio del backend. Se hai problemi, elimina il file `casa_prenotazioni.db` e riavvia.

## Sicurezza

**IMPORTANTE per produzione:**
1. Cambia la `SecretKey` JWT in `appsettings.json`
2. NON committare `appsettings.json` con password reali su Git
3. Usa variabili d'ambiente per dati sensibili
4. Abilita HTTPS per il backend
5. Usa password forti per gli account utente

## Licenza

Questo progetto è per uso personale e familiare.

## Supporto

Per problemi o domande, consulta la documentazione delle tecnologie utilizzate:
- [ASP.NET Core Docs](https://docs.microsoft.com/aspnet/core)
- [React Docs](https://react.dev)
- [Entity Framework Core Docs](https://docs.microsoft.com/ef/core)
