function Landing({ onEnter }) {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at 20% 50%, #0f3460 0%, #0a0a1a 50%, #1a0a2e 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '40px 20px', textAlign: 'center',
      position: 'relative', overflow: 'hidden'
    }}>

      {/* Decorative circles */}
      <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(62,207,142,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-100px', left: '-100px', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(24,95,165,0.2) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: '30%', left: '5%', width: '200px', height: '200px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(62,207,142,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

      {/* Floating dots */}
      {[...Array(20)].map((_, i) => (
        <div key={i} style={{
          position: 'absolute',
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          width: `${Math.random() * 4 + 2}px`,
          height: `${Math.random() * 4 + 2}px`,
          borderRadius: '50%',
          background: i % 2 === 0 ? 'rgba(62,207,142,0.6)' : 'rgba(100,180,255,0.4)',
          pointerEvents: 'none',
          boxShadow: '0 0 6px rgba(62,207,142,0.8)',
        }} />
      ))}

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ fontSize: '72px', marginBottom: '16px', filter: 'drop-shadow(0 0 20px rgba(62,207,142,0.8))' }}>🧠</div>
        <h1 style={{ color: 'white', fontSize: '48px', fontWeight: '700', marginBottom: '8px', textShadow: '0 0 40px rgba(62,207,142,0.4)' }}>EpiSafe School</h1>
        <p style={{ color: '#3ECF8E', fontSize: '18px', marginBottom: '48px', fontWeight: '500', letterSpacing: '0.05em' }}>Epilepsy management for Mauritian schools</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', maxWidth: '820px', marginBottom: '48px' }}>
          {[
            { icon: '📋', title: 'Seizure Risk Screener', desc: 'Identify learners who may be at risk with a structured screening tool' },
            { icon: '👥', title: 'Learner Registry', desc: 'Maintain a secure database of epilepsy cases with personalised action plans' },
            { icon: '📖', title: 'Staff Guides', desc: 'Equip all staff with clear, simple guides on seizure first aid and prevention' },
          ].map((f, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '16px', padding: '28px 20px', border: '1px solid rgba(62,207,142,0.25)' }}>
              <div style={{ fontSize: '36px', marginBottom: '12px' }}>{f.icon}</div>
              <h3 style={{ color: 'white', fontSize: '15px', marginBottom: '8px', fontWeight: '600' }}>{f.title}</h3>
              <p style={{ color: '#9ab', fontSize: '13px', lineHeight: '1.6' }}>{f.desc}</p>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '12px', marginBottom: '40px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {[
            '🇲🇺 Designed for Mauritius',
            '🔒 Secure & confidential',
            '📱 Works on any device',
            '🆓 Free for all schools',
          ].map((b, i) => (
            <div key={i} style={{ background: 'rgba(62,207,142,0.1)', border: '1px solid rgba(62,207,142,0.4)', borderRadius: '20px', padding: '8px 18px', color: '#3ECF8E', fontSize: '13px' }}>
              {b}
            </div>
          ))}
        </div>

        <button onClick={onEnter} style={{ background: 'linear-gradient(135deg, #3ECF8E, #2db87a)', color: 'white', border: 'none', borderRadius: '14px', padding: '16px 52px', fontSize: '18px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 0 30px rgba(62,207,142,0.4)', marginBottom: '12px' }}>
          Get Started →
        </button>
        <p style={{ color: '#567', fontSize: '13px', marginBottom: '60px' }}>Login or create an account to continue</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px', maxWidth: '500px' }}>
          {[
            { num: '176+', label: 'Secondary schools in Mauritius' },
            { num: '1 in 100', label: 'People live with epilepsy' },
            { num: '4 Zones', label: 'Covered across Mauritius' },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ color: '#3ECF8E', fontSize: '26px', fontWeight: '700' }}>{s.num}</div>
              <div style={{ color: '#567', fontSize: '12px', marginTop: '4px' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Landing