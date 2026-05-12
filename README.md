# waer — dein virtueller Kleiderschrank

PWA mit Next.js. Du fotografierst deine Kleidung, der Hintergrund wird direkt auf dem Handy entfernt, dann kannst du Outfits zusammenstellen — manuell, zufällig oder passend zum heutigen Wetter.

## Was du bekommst

- Login mit E-Mail/Passwort
- Kleiderschrank mit Foto pro Teil (Kategorie, Farbe, Saison, Anlass, Notizen)
- **Foto aufnehmen ODER aus Galerie hochladen**
- On-Device Hintergrund-Entfernung (gratis, unlimitiert)
- **AI-Auto-Tags** (OpenAI GPT-4o-mini erkennt Kategorie, Farbe, Saison, Anlass, Name)
- **AI-Outfit-Generator** mit optionalem Anlass („Date heute Abend", „Büro")
- Outfit-Modi: AI · Wetter · Zufall · Manuell
- PWA: auf iOS/Android zum Home-Screen, läuft wie eine App
- Dark Mode

## Einmal-Setup (≈ 10 Min)

### 1. Supabase-Projekt anlegen (gratis)

1. Geh auf https://supabase.com und log dich ein.
2. „New project" → Name `waer`, Region in der EU. Passwort merken.
3. Warte ~1 Min bis das Projekt bereit ist.
4. Im linken Menü auf **SQL Editor** → „New query".
5. Inhalt von [`supabase-schema.sql`](supabase-schema.sql) reinkopieren → **Run**. Das legt Tabellen, RLS-Policies und den Foto-Bucket an.
6. Links auf **Project Settings** → **API**. Kopier dir:
   - `Project URL`
   - `anon public` Key

### 2. OpenAI-API-Key holen

1. Geh auf https://platform.openai.com/api-keys → **Create new secret key**.
2. Key kopieren (beginnt mit `sk-...`).
3. Sofern noch keine Bezahldaten hinterlegt: kleines Guthaben (z.B. $5) einzahlen — Auto-Tagging eines Fotos kostet ~$0.001-0.002.

### 3. Lokal starten

```bash
cp .env.example .env.local
# .env.local öffnen und eintragen:
#   NEXT_PUBLIC_SUPABASE_URL      (aus 1.6)
#   NEXT_PUBLIC_SUPABASE_ANON_KEY (aus 1.6)
#   OPENAI_API_KEY                (aus 2.2)
npm install
npm run dev
```

Dann http://localhost:3000 öffnen. Konto anlegen → loslegen.

### 4. Online stellen (Vercel, gratis)

1. Erstell ein GitHub-Repo aus diesem Ordner.
2. Geh auf https://vercel.com, log dich mit GitHub ein → „New Project" → Repo auswählen.
3. **Environment Variables** in Vercel setzen:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `OPENAI_API_KEY`
4. **Deploy**. Du bekommst eine URL wie `dein-projekt.vercel.app`.

### 5. Aufs Handy installieren

- **iPhone (Safari):** URL öffnen → Teilen-Knopf → „Zum Home-Bildschirm".
- **Android (Chrome):** URL öffnen → Menü (⋮) → „App installieren".

Fertig — Icon auf dem Home-Screen, läuft wie eine richtige App.

## Stack

| Bereich | Tech |
|---|---|
| Framework | Next.js 14 App Router · TypeScript · Tailwind |
| Auth · DB · Storage | Supabase (Free Tier) |
| Hintergrund-Cutout | `@imgly/background-removal` per CDN, on-device (WebGPU/WASM) |
| AI (Tags + Outfits) | OpenAI GPT-4o-mini Vision |
| Wetter | Open-Meteo (kein API-Key) |
| Hosting | Vercel (Free Tier) |

## Projekt-Struktur

```
src/
  app/
    login, signup            — Auth
    wardrobe                 — Kleiderschrank + Detail
    wardrobe/add             — Foto/Galerie + Cutout + AI-Tags
    outfits                  — Liste + 4 Modi
    outfits/ai               — AI-Outfit mit Anlass-Eingabe
    outfits/weather          — Wetter-Outfit
    outfits/random           — Zufalls-Outfit
    outfits/create           — manuelles Outfit
    api/ai/categorize        — Server-Route: Foto → OpenAI → Tags
    api/ai/outfit            — Server-Route: Schrank → OpenAI → Outfit
    settings                 — Logout, Dark Mode
  lib/
    supabase/                — Auth-Clients (browser + server + middleware)
    openai.ts                — OpenAI-Wrapper mit JSON-Schema
    bgRemoval.ts             — lädt das Cutout-Modell per CDN
    weather.ts               — Open-Meteo + GPS
    outfit.ts                — Slot-Logik + Zufalls-Generator
    types.ts                 — Kategorien, Saisons, Anlässe
  components/                — TopBar, BottomNav
public/
  manifest.webmanifest       — PWA-Manifest
  icons/                     — App-Icons
supabase-schema.sql          — DB + Storage Setup
```

## Tipps

- **Erstes Foto dauert länger:** Das Cutout-Modell (~40 MB) wird einmal vom CDN geladen und gecacht. Ab dem zweiten Foto geht's schnell.
- **AI-Tags überschreiben nichts:** Wenn du Name/Farbe schon eingegeben hast, lässt die AI deine Eingabe stehen.
- **AI braucht den OpenAI-Key:** Ohne `OPENAI_API_KEY` funktioniert die Auto-Tag-Erkennung und der AI-Outfit-Knopf nicht — die App selbst läuft trotzdem.
- **Wetter braucht GPS-Erlaubnis:** Beim ersten Aufruf von „Wetter-Outfit" fragt der Browser. Wenn du ablehnst, in den Browser-Einstellungen für die Seite freigeben.
- **Saisons setzen lohnt sich:** Der Wetter-Modus filtert nach Saison — Teile ohne Saison-Tag werden immer berücksichtigt.

## Lizenz

Privates Projekt — pass die Lizenz an, falls du es teilen willst.
# wear
