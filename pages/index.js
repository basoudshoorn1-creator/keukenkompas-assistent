import { useState, useRef, useEffect } from 'react';
import Head from 'next/head';

const CHIPS = [
  'Inductiekoekenpan onder €80',
  'Le Creuset vs Staub',
  'Starterspakket thuiskok',
  'Is Lodge de moeite waard?',
  'Pan bakt ongelijkmatig',
];

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [history, setHistory] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  async function send(query) {
    if (!query.trim() || loading) return;
    setStarted(true);
    setInput('');
    setLoading(true);

    const newHistory = [...history, { role: 'user', content: query }];
    setHistory(newHistory);
    setMessages(prev => [...prev, { role: 'user', text: query }]);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newHistory }),
      });

      const data = await res.json();
      const raw = data.text || '';

      let antwoord = raw;
      let producten = [];
      try {
        const parsed = JSON.parse(raw.replace(/```json|```/g, '').trim());
        antwoord = parsed.antwoord || raw;
        producten = parsed.producten || [];
      } catch (e) {}

      setHistory(h => [...h, { role: 'assistant', content: raw }]);
      setMessages(prev => [...prev, { role: 'assistant', antwoord, producten }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'error', text: 'Er ging iets mis. Probeer het opnieuw.' }]);
    }

    setLoading(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  }

  return (
    <>
      <Head>
        <title>Keukenassistent — Keukenkompas</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;1,400&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet" />
      </Head>

      <div style={{
        minHeight: '100vh',
        background: '#F5F0E8',
        fontFamily: "'DM Sans', sans-serif",
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '0 16px 140px',
      }}>

        {/* Nav */}
        <div style={{
          width: '100%', maxWidth: 660,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '24px 0 0',
        }}>
          <a href="https://keukenkompas.nl" style={{
            fontSize: 18, fontWeight: 600, color: '#1A1510',
            letterSpacing: '-0.02em', textDecoration: 'none',
            fontFamily: "'Playfair Display', serif",
          }}>Keukenkompas</a>
          <div style={{ display: 'flex', gap: 20 }}>
            {['Pannen', 'Messen', 'Reviews'].map(l => (
              <a key={l} href={`https://keukenkompas.nl/${l.toLowerCase()}`} style={{
                fontSize: 13, color: '#8B7355', textDecoration: 'none',
              }}>{l}</a>
            ))}
          </div>
        </div>

        {/* Hero — only shown before first message */}
        {!started && (
          <div style={{ textAlign: 'center', marginTop: 72, marginBottom: 48, maxWidth: 560 }}>
            <p style={{
              fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase',
              color: '#C84B2F', marginBottom: 16,
            }}>AI-keukenhulp</p>
            <h1 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(36px, 8vw, 64px)', fontWeight: 400,
              lineHeight: 1.05, letterSpacing: '-0.03em',
              color: '#1A1510', marginBottom: 14,
            }}>
              Wat wil je weten<br />over je <em style={{ color: '#C84B2F' }}>keuken?</em>
            </h1>
            <p style={{ fontSize: 16, color: '#8B7355', fontWeight: 300, lineHeight: 1.6 }}>
              Stel je vraag — krijg een eerlijk, persoonlijk antwoord.
            </p>
          </div>
        )}

        {started && <div style={{ height: 72 }} />}

        {/* Chat messages */}
        <div style={{ width: '100%', maxWidth: 660, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {messages.map((m, i) => (
            <div key={i}>
              {m.role === 'user' && (
                <div style={{
                  marginLeft: 'auto', width: 'fit-content', maxWidth: '85%',
                  background: '#1A1510', color: '#F5F0E8',
                  borderRadius: '18px 18px 4px 18px',
                  padding: '12px 18px', fontSize: 15, lineHeight: 1.5, fontWeight: 300,
                }}>{m.text}</div>
              )}

              {m.role === 'assistant' && (
                <div style={{
                  background: 'white', border: '1.5px solid rgba(26,21,16,0.1)',
                  borderRadius: '4px 18px 18px 18px', padding: '18px 20px',
                  boxShadow: '0 2px 16px rgba(26,21,16,0.05)',
                }}>
                  <p style={{
                    fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase',
                    color: '#C84B2F', marginBottom: 8,
                  }}>Keukenkompas</p>
                  <p style={{
                    fontSize: 15, lineHeight: 1.75, color: '#1A1510',
                    fontWeight: 300, whiteSpace: 'pre-wrap',
                  }}>{m.antwoord}</p>

                  {m.producten?.length > 0 && (
                    <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {m.producten.map((p, j) => (
                        <div key={j} style={{
                          background: '#EDEAE2', borderRadius: 14,
                          overflow: 'hidden', border: '1px solid rgba(26,21,16,0.07)',
                        }}>
                          <div style={{ padding: '12px 14px' }}>
                            <p style={{ fontSize: 14, fontWeight: 600, color: '#1A1510', marginBottom: 3 }}>
                              {p.naam}
                            </p>
                            <p style={{ fontSize: 12, color: '#8B7355' }}>{p.omschrijving}</p>
                          </div>

                          <div style={{
                            display: 'flex', alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '10px 14px',
                            borderTop: '1px solid rgba(26,21,16,0.07)',
                            background: 'rgba(255,255,255,0.5)',
                          }}>
                            {p.review ? (
                              <a href={p.review} style={{ fontSize: 12, color: '#8B7355', textDecoration: 'none' }}>
                                Lees review ↗
                              </a>
                            ) : (
                              <span style={{ fontSize: 12, color: '#C8B99A' }}>Review binnenkort</span>
                            )}
                            <div style={{ display: 'flex', gap: 6 }}>
                              {p.bol && (
                                <a href={p.bol} target="_blank" rel="noopener sponsored" style={{
                                  background: '#C84B2F', color: 'white',
                                  borderRadius: 8, padding: '6px 12px',
                                  fontSize: 12, fontWeight: 500, textDecoration: 'none',
                                }}>Bol.com ↗</a>
                              )}
                              {p.coolblue && (
                                <a href={p.coolblue} target="_blank" rel="noopener sponsored" style={{
                                  background: 'white', color: '#1A1510',
                                  border: '1px solid rgba(26,21,16,0.15)',
                                  borderRadius: 8, padding: '6px 12px',
                                  fontSize: 12, fontWeight: 500, textDecoration: 'none',
                                }}>Coolblue</a>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {m.role === 'error' && (
                <p style={{ color: '#C84B2F', fontSize: 13, paddingLeft: 4 }}>{m.text}</p>
              )}
            </div>
          ))}

          {loading && (
            <div style={{
              background: 'white', border: '1.5px solid rgba(26,21,16,0.1)',
              borderRadius: '4px 18px 18px 18px', padding: '16px 20px',
              display: 'flex', gap: 5, alignItems: 'center',
              boxShadow: '0 2px 16px rgba(26,21,16,0.05)',
            }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{
                  width: 7, height: 7, borderRadius: '50%', background: '#E8957A',
                  animation: `bounce 1.2s ${i * 0.2}s infinite`,
                }} />
              ))}
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Chips — only before first message */}
        {!started && (
          <div style={{
            display: 'flex', flexWrap: 'wrap', gap: 8,
            justifyContent: 'center', maxWidth: 620, marginTop: 20,
          }}>
            {CHIPS.map(c => (
              <button key={c} onClick={() => send(c)} style={{
                background: '#EDEAE2', border: '1px solid rgba(26,21,16,0.12)',
                borderRadius: 32, padding: '8px 16px',
                fontSize: 13, color: '#8B7355', cursor: 'pointer',
                fontFamily: "'DM Sans', sans-serif",
              }}>{c}</button>
            ))}
          </div>
        )}

        {/* Fixed input bar */}
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          background: 'linear-gradient(to top, #F5F0E8 70%, transparent)',
          padding: '16px 16px 28px',
          display: 'flex', justifyContent: 'center',
        }}>
          <div style={{
            width: '100%', maxWidth: 660,
            display: 'flex', alignItems: 'center',
            background: 'white', border: '1.5px solid rgba(26,21,16,0.12)',
            borderRadius: 48, padding: '6px 6px 6px 20px',
            boxShadow: '0 4px 24px rgba(26,21,16,0.08)',
          }}>
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send(input)}
              placeholder={started ? 'Stel een vervolgvraag...' : 'Bijv. welke pan past bij inductie en €60?'}
              style={{
                flex: 1, border: 'none', outline: 'none', background: 'transparent',
                fontSize: 15, fontFamily: "'DM Sans', sans-serif", fontWeight: 300,
                color: '#1A1510', padding: '8px 0',
              }}
            />
            <button
              onClick={() => send(input)}
              disabled={loading || !input.trim()}
              style={{
                background: loading || !input.trim() ? '#8B7355' : '#C84B2F',
                color: 'white', border: 'none', borderRadius: 40,
                padding: '10px 20px', fontSize: 14, fontWeight: 500,
                fontFamily: "'DM Sans', sans-serif",
                cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
                whiteSpace: 'nowrap', transition: 'background 0.2s',
              }}
            >{loading ? '...' : 'Vraag het →'}</button>
          </div>
        </div>
      </div>

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #F5F0E8; }
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
          40% { transform: scale(1.2); opacity: 1; }
        }
      `}</style>
    </>
  );
}
