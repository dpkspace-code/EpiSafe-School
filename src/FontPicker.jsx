import { useState, useEffect } from 'react'

const fonts = [
  { name: 'Default (Inter)', value: 'Inter, sans-serif' },
  { name: 'Roboto', value: 'Roboto, sans-serif' },
  { name: 'Open Sans', value: '"Open Sans", sans-serif' },
  { name: 'Lato', value: 'Lato, sans-serif' },
  { name: 'Poppins', value: 'Poppins, sans-serif' },
  { name: 'Nunito', value: 'Nunito, sans-serif' },
  { name: 'Montserrat', value: 'Montserrat, sans-serif' },
  { name: 'Source Sans 3', value: '"Source Sans 3", sans-serif' },
  { name: 'Merriweather', value: 'Merriweather, serif' },
  { name: 'Playfair Display', value: '"Playfair Display", serif' },
  { name: 'Georgia', value: 'Georgia, serif' },
  { name: 'Times New Roman', value: '"Times New Roman", Times, serif' },
  { name: 'Courier New', value: '"Courier New", Courier, monospace' },
  { name: 'Comic Neue', value: '"Comic Neue", cursive' },
  { name: 'Quicksand', value: 'Quicksand, sans-serif' },
  { name: 'Raleway', value: 'Raleway, sans-serif' },
  { name: 'PT Sans', value: '"PT Sans", sans-serif' },
]

const DEFAULT_SIZE = 24

export function applyStoredFont() {
  const savedFont = localStorage.getItem('episafe-font')
  if (savedFont) document.documentElement.style.fontFamily = savedFont

  const savedSize = localStorage.getItem('episafe-font-size')
  if (savedSize) document.documentElement.style.fontSize = `${savedSize}px`
}

function FontPicker({ floating = true }) {
  const [selected, setSelected] = useState(() => localStorage.getItem('episafe-font') || fonts[0].value)
  const [size, setSize] = useState(() => parseInt(localStorage.getItem('episafe-font-size')) || DEFAULT_SIZE)

  useEffect(() => {
    document.documentElement.style.fontFamily = selected
    localStorage.setItem('episafe-font', selected)
  }, [selected])

  useEffect(() => {
    document.documentElement.style.fontSize = `${size}px`
    localStorage.setItem('episafe-font-size', size)
  }, [size])

  if (floating) {
    return (
      <div style={{
        position: 'fixed', bottom: '16px', right: '16px', zIndex: 999,
        background: 'white', borderRadius: '10px', padding: '10px 12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.12)', display: 'flex',
        flexDirection: 'column', gap: '8px', minWidth: '180px',
      }}>
        <select
          value={selected}
          onChange={e => setSelected(e.target.value)}
          style={{ padding: '6px 8px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '13px', cursor: 'pointer', color: '#333' }}
        >
          {fonts.map(f => <option key={f.value} value={f.value}>{f.name}</option>)}
        </select>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '11px', color: '#888' }}>A</span>
          <input
            type="range" min="12" max="24" step="1"
            value={size}
            onChange={e => setSize(parseInt(e.target.value))}
            style={{ flex: 1 }}
          />
          <span style={{ fontSize: '16px', color: '#888' }}>A</span>
          <span style={{ fontSize: '11px', color: '#aaa', minWidth: '28px', textAlign: 'right' }}>{size}px</span>
        </div>
      </div>
    )
  }

  // Sidebar / inline variant
  return (
    <div style={{ padding: '0 12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div className="form-group" style={{ marginBottom: 0 }}>
        <label style={{ fontSize: '11px', color: '#666' }}>🔤 App Font</label>
        <select value={selected} onChange={e => setSelected(e.target.value)}>
          {fonts.map(f => <option key={f.value} value={f.value}>{f.name}</option>)}
        </select>
      </div>
      <div>
        <label style={{ fontSize: '11px', color: '#666', display: 'block', marginBottom: '4px' }}>Font Size: {size}px</label>
        <input
          type="range" min="12" max="24" step="1"
          value={size}
          onChange={e => setSize(parseInt(e.target.value))}
          style={{ width: '100%' }}
        />
      </div>
    </div>
  )
}

export default FontPicker