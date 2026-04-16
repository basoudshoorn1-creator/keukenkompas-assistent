# Keukenkompas Keukenassistent

## Deployen op Vercel

### Stap 1 — Upload naar GitHub
1. Ga naar github.com → New repository
2. Naam: `keukenkompas-assistent`
3. Upload alle bestanden uit deze map

### Stap 2 — Deploy op Vercel
1. Ga naar vercel.com
2. Klik "Add New Project"
3. Kies je GitHub repository
4. Klik "Deploy" — Vercel herkent Next.js automatisch

### Stap 3 — API key instellen
1. In Vercel → jouw project → Settings → Environment Variables
2. Voeg toe:
   - Name: `ANTHROPIC_API_KEY`
   - Value: jouw Anthropic API key (begint met `sk-ant-...`)
3. Klik Save → Redeploy

### Stap 4 — Embedden in Elementor
1. Kopieer je Vercel URL (bijv. `https://keukenkompas-assistent.vercel.app`)
2. Maak een nieuwe pagina in WordPress: "Keukenassistent"
3. Voeg een HTML-widget toe in Elementor
4. Plak deze code:

```html
<iframe 
  src="https://JOUW-VERCEL-URL.vercel.app" 
  width="100%" 
  height="800px" 
  frameborder="0"
  style="border-radius: 12px;"
></iframe>
```

5. Voeg "Keukenassistent" toe aan je WordPress navigatiemenu

## Affiliate links updaten
In `pages/api/chat.js` kun je de Bol.com en Coolblue URLs vervangen door jouw echte affiliate deep links.
