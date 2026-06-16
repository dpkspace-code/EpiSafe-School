import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'

function Landing() {
  const navigate = useNavigate()
  const [installPrompt, setInstallPrompt] = useState(null)
  const [installed, setInstalled] = useState(false)

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault()
      setInstallPrompt(e)
    }
    window.addEventListener('beforeinstallprompt', handler)
    window.addEventListener('appinstalled', () => setInstalled(true))
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!installPrompt) return
    installPrompt.prompt()
    const { outcome } = await installPrompt.userChoice
    if (outcome === 'accepted') setInstalled(true)
    setInstallPrompt(null)
  }

  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      background: 'radial-gradient(ellipse at 20% 50%, #0f3460 0%, #0a0a1a 50%, #1a0a2e 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      padding: '80px 20px 60px 20px',
      textAlign: 'center',
      position: 'relative',
      overflow: 'visible',
      boxSizing: 'border-box',
    }}>

      {/* Decorative circles */}
      <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(62,207,142,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-100px', left: '-100px', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(24,95,165,0.2) 0%, transparent 70%)', pointerEvents: 'none' }} />

      {/* Floating dots */}
      {[...Array(20)].map((_, i) => (
        <div key={i} style={{
          position: 'absolute',
          left: `${5 + (i * 37) % 90}%`,
          top: `${5 + (i * 53) % 90}%`,
          width: `${2 + (i % 3)}px`,
          height: `${2 + (i % 3)}px`,
          borderRadius: '50%',
          background: i % 2 === 0 ? 'rgba(62,207,142,0.6)' : 'rgba(100,180,255,0.4)',
          pointerEvents: 'none',
          boxShadow: '0 0 6px rgba(62,207,142,0.8)',
        }} />
      ))}

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '900px' }}>

        {/* Logo */}
        <div style={{ marginBottom: '20px' }}>
          <img
            src="/episafe_icon_512.png"
            alt="EpiSafe School"
            style={{
              width: '110px',
              height: '110px',
              borderRadius: '24px',
              objectFit: 'cover',
              boxShadow: '0 0 40px rgba(150,80,220,0.7)',
            }}
          />
        </div>

        <h1 style={{ color: 'white', fontSize: '3rem', fontWeight: '700', marginBottom: '8px', textShadow: '0 0 40px rgba(62,207,142,0.4)' }}>EpiSafe School</h1>
        <div style={{ width: '80px', height: '3px', background: 'linear-gradient(90deg, #3ECF8E, transparent)', borderRadius: '2px', margin: '0 auto 12px' }} />
        <p style={{ color: '#3ECF8E', fontSize: '1.125rem', marginBottom: '48px', fontWeight: '500', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Epilepsy Management for Secondary Schools: MAURITIUS</p>

        {/* Feature cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '48px' }}>
          {[
            { icon: '📋', title: 'Seizure Risk Screener', desc: 'Identify learners who may be at risk with a structured screening tool' },
            { icon: '👥', title: 'Learner Registry', desc: 'Maintain a secure database of epilepsy cases with personalised action plans' },
            { icon: '📖', title: 'Staff Guides', desc: 'Equip all staff with clear, simple guides on seizure first aid and prevention' },
          ].map((f, i) => (
            <div
              key={i}
              onClick={() => navigate('/login')}
              style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '16px', padding: '28px 20px', border: '1px solid rgba(62,207,142,0.25)', cursor: 'pointer', transition: 'transform 0.2s, border-color 0.2s' }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(62,207,142,0.6)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(62,207,142,0.25)'; e.currentTarget.style.transform = 'translateY(0)' }}
            >
              <div style={{ fontSize: '2.25rem', marginBottom: '12px' }}>{f.icon}</div>
              <h3 style={{ color: 'white', fontSize: '0.9375rem', marginBottom: '8px', fontWeight: '600' }}>{f.title}</h3>
              <p style={{ color: '#9ab', fontSize: '0.8125rem', lineHeight: '1.6' }}>{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Get started button */}
        <button onClick={() => navigate('/login')} style={{ background: 'linear-gradient(135deg, #3ECF8E, #2db87a)', color: 'white', border: 'none', borderRadius: '14px', padding: '16px 52px', fontSize: '1.125rem', fontWeight: '600', cursor: 'pointer', boxShadow: '0 0 30px rgba(62,207,142,0.4)', marginBottom: '16px' }}>
          Get Started →
        </button>

        {/* Install App button */}
        {!installed && installPrompt && (
          <div style={{ marginBottom: '32px' }}>
            <button
              onClick={handleInstall}
              style={{
                background: 'rgba(255,255,255,0.08)',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '14px',
                padding: '12px 32px',
                fontSize: '0.9375rem',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              📲 Install App
            </button>
            <p style={{ color: '#567', fontSize: '0.75rem', marginTop: '6px' }}>Add to your home screen for quick access</p>
          </div>
        )}

        {installed && (
          <p style={{ color: '#3ECF8E', fontSize: '0.875rem', marginBottom: '32px' }}>✅ App installed successfully!</p>
        )}

        {!installPrompt && !installed && (
          <p style={{ color: '#567', fontSize: '0.75rem', marginBottom: '32px' }}>
            To install: tap your browser menu → <em>Add to Home Screen</em>
          </p>
        )}

        {/* Badge pills — bottom row */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {[
            '🇲🇺 Designed for Mauritius',
            '🔒 Secure & confidential',
            '📱 Works on any device',
            '🆓 Free for all schools',
          ].map((b, i) => (
            <div key={i} style={{ background: 'rgba(62,207,142,0.1)', border: '1px solid rgba(62,207,142,0.4)', borderRadius: '20px', padding: '8px 18px', color: '#3ECF8E', fontSize: '0.8125rem' }}>
              {b}
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}

export default Landing
