# Guida al Deployment Online

Questa guida ti accompagna passo-passo per pubblicare il sito online gratuitamente usando **Railway** (backend) e **Vercel** (frontend).

## Panoramica

- **Backend** (API .NET) → Railway (gratis)
- **Frontend** (React) → Vercel (gratis)
- **Totale costo**: 0€

## PARTE 1: Deploy del Backend su Railway

### Step 1: Creare account Railway

1. Vai su [railway.app](https://railway.app)
2. Clicca "Start a New Project"
3. Accedi con GitHub (consigliato) o email

### Step 2: Creare progetto su GitHub (necessario)

Railway funziona meglio con GitHub. Devi prima caricare il codice su GitHub:

1. Vai su [github.com](https://github.com) e accedi
2. Clicca il "+" in alto a destra → "New repository"
3. Nome: `casa-prenotazioni` (o come preferisci)
4. Lascia tutto privato se vuoi
5. **NON** aggiungere README, .gitignore o licenza
6. Clicca "Create repository"

### Step 3: Caricare il codice su GitHub

Apri il terminale nella cartella `SitoPadolina` e esegui:

```bash
# Inizializzare Git (se non l'hai già fatto)
git init

# Aggiungere tutti i file
git add .

# Creare il primo commit
git commit -m "Initial commit"

# Collegare al repository GitHub (SOSTITUISCI con il tuo username)
git remote add origin https://github.com/TUO-USERNAME/casa-prenotazioni.git

# Caricare il codice
git branch -M main
git push -u origin main
```

**IMPORTANTE**: Sostituisci `TUO-USERNAME` con il tuo username GitHub!

### Step 4: Deploy su Railway

1. Torna su [railway.app](https://railway.app)
2. Clicca "Start a New Project"
3. Seleziona "Deploy from GitHub repo"
4. Autorizza Railway ad accedere a GitHub
5. Seleziona il repository `casa-prenotazioni`
6. Railway rileverà automaticamente il Dockerfile nel Backend

### Step 5: Configurare le variabili d'ambiente su Railway

Nella dashboard Railway, clicca sul tuo servizio → Tab "Variables":

Aggiungi queste variabili (copia-incolla):

```
ASPNETCORE_ENVIRONMENT=Production
ASPNETCORE_URLS=http://0.0.0.0:8080
PORT=8080

JwtSettings__SecretKey=ChiaveSegretaSuperSicuraPerJWT12345678901234567890
JwtSettings__Issuer=CasaPrenotazioniAPI
JwtSettings__Audience=CasaPrenotazioniClient
JwtSettings__ExpirationHours=24

ConnectionStrings__DefaultConnection=Data Source=/app/data/casa_prenotazioni.db
```

**Per le email (opzionale)**, aggiungi anche:

```
EmailSettings__SmtpServer=smtp.gmail.com
EmailSettings__SmtpPort=587
EmailSettings__SenderEmail=tuaemail@gmail.com
EmailSettings__SenderName=Casa Prenotazioni
EmailSettings__Username=tuaemail@gmail.com
EmailSettings__Password=password_app_google
```

### Step 6: Configurare il Root Directory

1. Nel progetto Railway → Settings
2. Cerca "Root Directory"
3. Imposta su: `Backend`
4. Salva

### Step 7: Deploy!

1. Railway inizierà automaticamente a buildare
2. Aspetta 2-3 minuti
3. Una volta completato, clicca su "Settings" → "Networking"
4. Clicca "Generate Domain"
5. **COPIA L'URL** (tipo: `https://casa-prenotazioni-production-xxxx.up.railway.app`)

### Step 8: Aggiungere CORS per Vercel

Ora devi aggiungere il CORS. Torna su Railway → Variables e aggiungi:

```
AllowedOrigins__0=http://localhost:5173
```

Dopo che avrai l'URL di Vercel (prossimo step), aggiungerai:

```
AllowedOrigins__1=https://IL-TUO-SITO.vercel.app
```

✅ **Backend online!** Ora passiamo al frontend.

---

## PARTE 2: Deploy del Frontend su Vercel

### Step 1: Preparare il Frontend

Crea il file `.env.production` nella cartella `Frontend`:

```bash
cd Frontend
```

Crea un file chiamato `.env.production` con questo contenuto:

```
VITE_API_URL=https://IL-TUO-BACKEND.railway.app/api
```

**SOSTITUISCI** `IL-TUO-BACKEND.railway.app` con l'URL di Railway che hai copiato prima!

### Step 2: Committare le modifiche

```bash
# Torna nella cartella principale
cd ..

# Aggiungi le modifiche
git add .
git commit -m "Add production config"
git push
```

### Step 3: Deploy su Vercel

1. Vai su [vercel.com](https://vercel.com)
2. Accedi con GitHub
3. Clicca "Add New..." → "Project"
4. Seleziona il repository `casa-prenotazioni`
5. Vercel rileva automaticamente che è Vite/React

**IMPORTANTE - Configurazione Build:**

- **Framework Preset**: Vite
- **Root Directory**: `Frontend` ← CAMBIA QUI!
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

### Step 4: Variabili d'ambiente su Vercel

1. Prima di fare deploy, clicca "Environment Variables"
2. Aggiungi:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://IL-TUO-BACKEND.railway.app/api` (il tuo URL Railway)
   - **Environment**: Production
3. Clicca "Add"

### Step 5: Deploy!

1. Clicca "Deploy"
2. Aspetta 1-2 minuti
3. Vercel ti darà un URL tipo: `https://casa-prenotazioni.vercel.app`

### Step 6: Aggiornare CORS su Railway

Ora che hai l'URL Vercel:

1. Torna su Railway → Variables
2. Aggiungi: `AllowedOrigins__1=https://IL-TUO-SITO.vercel.app`
3. Railway riavvierà automaticamente

---

## 🎉 FATTO! Il Sito è Online!

Vai su `https://IL-TUO-SITO.vercel.app` e dovresti vedere il sito funzionante!

---

## Cosa Condividere con l'Amico

Condividi semplicemente l'URL di Vercel:

```
https://IL-TUO-SITO.vercel.app
```

Lui potrà:
1. Registrarsi
2. Fare login
3. Creare prenotazioni
4. Vedere il calendario

---

## Note Importanti

### ⚠️ Limitazioni del Free Tier

**Railway (Backend):**
- 500 ore al mese (più che sufficienti per un progetto familiare)
- Il database SQLite persiste tra i deploy
- Se non usi il sito per molto tempo, potrebbe spegnersi (si riavvia al primo accesso in ~30 secondi)

**Vercel (Frontend):**
- Completamente gratuito
- Sempre online
- Deploy automatici ad ogni push su GitHub

### 🔄 Come Aggiornare il Sito

Ogni volta che modifichi il codice:

```bash
git add .
git commit -m "Descrizione modifiche"
git push
```

- Railway e Vercel rilevano automaticamente le modifiche
- Fanno il deploy automatico in pochi minuti

### 🗄️ Gestione Database

Il database SQLite su Railway persiste, MA:
- Se aggiorni il modello database, devi eliminare il vecchio
- Su Railway → servizio → Data → Volume → Delete
- Riavvia il servizio

### 📧 Email

Per attivare le notifiche email:
1. Genera password app Google (vedi README.md)
2. Aggiungi le variabili `EmailSettings__*` su Railway
3. Riavvia il servizio

---

## Troubleshooting

### Frontend non si connette al backend

1. Verifica che `VITE_API_URL` su Vercel sia corretto
2. Verifica che `AllowedOrigins__1` su Railway contenga l'URL di Vercel
3. Controlla i log su Railway (tab "Logs")

### Errore CORS

- Assicurati che `AllowedOrigins__0` e `AllowedOrigins__1` su Railway siano corretti
- Ricorda: URL con https, senza "/" finale

### Backend non parte su Railway

1. Controlla i logs su Railway
2. Verifica che "Root Directory" sia impostato su `Backend`
3. Verifica che tutte le variabili d'ambiente siano presenti

### Vercel non trova il progetto

- Verifica che "Root Directory" sia impostato su `Frontend`
- Ricontrolla Framework Preset = Vite

---

## Link Utili

- [Railway Dashboard](https://railway.app/dashboard)
- [Vercel Dashboard](https://vercel.com/dashboard)
- [GitHub Repository](https://github.com/TUO-USERNAME/casa-prenotazioni)

---

## Riassunto Veloce

```bash
# 1. Setup Git e GitHub
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/TUO-USERNAME/casa-prenotazioni.git
git push -u origin main

# 2. Railway
# - Deploy from GitHub
# - Root Directory: Backend
# - Aggiungi variabili d'ambiente
# - Genera domain
# - Copia URL

# 3. Frontend - Crea .env.production
echo "VITE_API_URL=https://TUO-BACKEND.railway.app/api" > Frontend/.env.production

# 4. Commit e push
git add .
git commit -m "Add production config"
git push

# 5. Vercel
# - Import da GitHub
# - Root Directory: Frontend
# - Aggiungi VITE_API_URL
# - Deploy
# - Copia URL Vercel

# 6. Aggiorna CORS su Railway
# AllowedOrigins__1 = URL Vercel
```

**FATTO!** 🚀
