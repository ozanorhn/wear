# waer — dein virtueller Kleiderschrank

PWA mit Next.js. Du fotografierst deine Kleidung, der Hintergrund wird direkt auf dem Handy entfernt, dann kannst du Outfits zusammenstellen — manuell, zufällig oder passend zum heutigen Wetter.

## Was du bekommst

- Login mit E-Mail/Passwort
- Kleiderschrank mit Foto pro Teil (Kategorie, Farbe, Saison, Anlass, Notizen)
- On-Device Hintergrund-Entfernung (gratis, unlimitiert)
- Outfit-Modi: manuell · Zufall · Wetter (per GPS)
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

### 2. Lokal starten

```bash
cp .env.example .env.local
# .env.local öffnen und beide Werte aus Schritt 1.6 eintragen
npm install
npm run dev
```

Dann http://localhost:3000 öffnen. Konto anlegen → loslegen.

### 3. Online stellen (Vercel, gratis)

1. Erstell ein GitHub-Repo aus diesem Ordner.
2. Geh auf https://vercel.com, log dich mit GitHub ein → „New Project" → Repo auswählen.
3. **Environment Variables** in Vercel setzen:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. **Deploy**. Du bekommst eine URL wie `dein-projekt.vercel.app`.

### 4. Aufs Handy installieren

- **iPhone (Safari):** URL öffnen → Teilen-Knopf → „Zum Home-Bildschirm".
- **Android (Chrome):** URL öffnen → Menü (⋮) → „App installieren".

Fertig — Icon auf dem Home-Screen, läuft wie eine richtige App.

## Stack

| Bereich | Tech |
|---|---|
| Framework | Next.js 14 App Router · TypeScript · Tailwind |
| Auth · DB · Storage | Supabase (Free Tier) |
| Hintergrund-Cutout | `@imgly/background-removal` per CDN, on-device (WebGPU/WASM) |
| Wetter | Open-Meteo (kein API-Key) |
| Hosting | Vercel (Free Tier) |

## Projekt-Struktur

```
src/
  app/
    login, signup            — Auth
    wardrobe                 — Kleiderschrank + Detail
    wardrobe/add             — Foto + Cutout + Tags
    outfits                  — Liste + 3 Modi
    outfits/create           — manuelles Outfit
    outfits/random           — Zufalls-Outfit
    outfits/weather          — Wetter-Outfit
    settings                 — Logout, Dark Mode
  lib/
    supabase/                — Auth-Clients (browser + server + middleware)
    bgRemoval.ts             — lädt das Modell per CDN
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
- **Wetter braucht GPS-Erlaubnis:** Beim ersten Aufruf von „Wetter-Outfit" fragt der Browser. Wenn du ablehnst, in den Browser-Einstellungen für die Seite freigeben.
- **Saisons setzen lohnt sich:** Der Wetter-Modus filtert nach Saison — Teile ohne Saison-Tag werden immer berücksichtigt.

## Lizenz

Privates Projekt — pass die Lizenz an, falls du es teilen willst.
# wear
