# 🚀 Guida Rapida Deploy (5 minuti)

Vuoi il sito online SUBITO? Segui questi step:

## 1️⃣ GitHub (1 minuto)

```bash
cd C:\Corsi\SitoPadolina

git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/TUO-USERNAME/casa-prenotazioni.git
git push -u origin main
```

**Sostituisci `TUO-USERNAME`** con il tuo username GitHub!

## 2️⃣ Railway - Backend (2 minuti)

1. Vai su [railway.app](https://railway.app)
2. Login con GitHub
3. "New Project" → "Deploy from GitHub repo"
4. Seleziona `casa-prenotazioni`
5. Vai su **Settings** → Root Directory → `Backend`
6. Vai su **Variables** → Aggiungi:

```
ASPNETCORE_ENVIRONMENT=Production
ASPNETCORE_URLS=http://0.0.0.0:8080
PORT=8080
JwtSettings__SecretKey=ChiaveSegretaSuperSicuraPerJWT12345678901234567890
JwtSettings__Issuer=CasaPrenotazioniAPI
JwtSettings__Audience=CasaPrenotazioniClient
ConnectionStrings__DefaultConnection=Data Source=/app/data/casa_prenotazioni.db
AllowedOrigins__0=http://localhost:5173
```

7. Vai su **Settings** → **Networking** → "Generate Domain"
8. **COPIA L'URL** (es: `https://xxx.railway.app`)

## 3️⃣ Crea .env.production (30 secondi)

Crea il file `Frontend/.env.production`:

```
VITE_API_URL=https://IL-TUO-URL.railway.app/api
```

Sostituisci con l'URL Railway!

```bash
git add Frontend/.env.production
git commit -m "Add production config"
git push
```

## 4️⃣ Vercel - Frontend (1 minuto)

1. Vai su [vercel.com](https://vercel.com)
2. Login con GitHub
3. "Add New..." → "Project"
4. Seleziona `casa-prenotazioni`
5. **Root Directory**: `Frontend`
6. **Environment Variables**:
   - Nome: `VITE_API_URL`
   - Valore: `https://IL-TUO-URL.railway.app/api`
7. Click "Deploy"
8. **COPIA L'URL VERCEL** (es: `https://casa-prenotazioni.vercel.app`)

## 5️⃣ Aggiorna CORS (30 secondi)

Torna su Railway → Variables → Aggiungi:

```
AllowedOrigins__1=https://IL-TUO-SITO.vercel.app
```

## ✅ FATTO!

Vai su `https://IL-TUO-SITO.vercel.app` e il sito è online!

Condividi l'URL con il tuo amico!

---

**Problemi?** Leggi la guida completa: [DEPLOYMENT.md](DEPLOYMENT.md)
