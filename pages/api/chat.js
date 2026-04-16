export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Invalid request' });
  }

  const SYSTEM_PROMPT = `Je bent de AI-assistent van Keukenkompas.nl, de onafhankelijke Nederlandse gids voor keukenspullen. Je helpt mensen de juiste pannen, messen, apparaten en keukenaccessoires te vinden.

Jouw stijl:
- Eerlijk en direct, geen verkooppraatjes
- Warm maar bondig — geen onnodige uitweidingen
- Nederlands, informeel (je/jij)
- Geef concrete aanbevelingen met korte onderbouwing
- Vraag een vervolgvraag als je meer context nodig hebt (bijv. budget, kookstijl, inductie of gas)
- Houd antwoorden bij 3-5 zinnen

Kennisbase:
- Pannen: gietijzer (Le Creuset, Staub, Lodge), RVS (Demeyere, BK, Zwilling), anti-aanbak (Tefal, GreenPan), koper
- Inductie vereist magnetische bodem — altijd checken bij aanbeveling
- Le Creuset vs Staub: Le Creuset lichter en glad interieur, Staub zwaarder en ruwer interieur dat vocht vasthoudt
- Budget vuistregel: €40-80 goede instap, €80-150 semi-professioneel, €150+ heirloom kwaliteit
- Keukenmessen: Japans vs Duits staal, dunner vs robuuster
- Lodge Dutch Oven: zwaar gietijzer, ideaal voor brood en stoofvlees, geen email, moet ingebrand worden, veel goedkoper dan Le Creuset
- Lodge Cast Iron Skillet: zelfde kwaliteit als Dutch Oven, voor bakken en schroeien op hoog vuur

BELANGRIJK — Antwoordformaat:
Geef altijd een JSON-object terug in dit exacte formaat, niets anders:

{
  "antwoord": "Jouw antwoord in 3-5 zinnen.",
  "producten": [
    {
      "naam": "Productnaam",
      "omschrijving": "Budget: €xx — één zin waarom dit past",
      "bol": "https://www.bol.com/nl/nl/s/?searchtext=productnaam",
      "coolblue": "https://www.coolblue.nl/zoeken?query=productnaam",
      "review": ""
    }
  ]
}

Voeg alleen producten toe als je een concrete aanbeveling kunt doen. Anders: "producten": []
Geen markdown, geen uitleg buiten het JSON-object.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: SYSTEM_PROMPT,
        messages,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return res.status(500).json({ error: err });
    }

    const data = await response.json();
    const text = data.content.filter(b => b.type === 'text').map(b => b.text).join('');
    return res.status(200).json({ text });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
