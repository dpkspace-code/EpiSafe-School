import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

const seizureTypes = [
  { value: 'Tonic-clonic (Grand mal)', label: 'Tonic-clonic (Grand mal)', desc: 'Body stiffens then jerks — person may fall and lose consciousness' },
  { value: 'Absence', label: 'Absence', desc: 'Brief blank stare, unresponsive for a few seconds — looks like daydreaming' },
  { value: 'Focal (Partial)', label: 'Focal (Partial)', desc: 'Affects one part of body, person may stay conscious but appear confused' },
  { value: 'Atonic (Drop attack)', label: 'Atonic (Drop attack)', desc: 'Sudden loss of muscle tone causing person to fall without warning' },
  { value: 'Myoclonic', label: 'Myoclonic', desc: 'Sudden brief muscle jerks, often in arms or upper body' },
  { value: 'Unknown / Not yet diagnosed', label: 'Unknown / Not yet diagnosed', desc: 'Seizure type not yet confirmed by a doctor' },
]

const medications = [
  { value: 'Sodium Valproate (Epilim)', label: 'Sodium Valproate (Epilim)', desc: 'Common for tonic-clonic and absence seizures' },
  { value: 'Carbamazepine (Tegretol)', label: 'Carbamazepine (Tegretol)', desc: 'Often used for focal seizures' },
  { value: 'Lamotrigine (Lamictal)', label: 'Lamotrigine (Lamictal)', desc: 'Used for various seizure types' },
  { value: 'Levetiracetam (Keppra)', label: 'Levetiracetam (Keppra)', desc: 'Broad spectrum anti-epileptic' },
  { value: 'Phenobarbitone', label: 'Phenobarbitone', desc: 'Older medication still used in some cases' },
  { value: 'Clonazepam (Rivotril)', label: 'Clonazepam (Rivotril)', desc: 'Used for myoclonic and absence seizures' },
  { value: 'Multiple medications', label: 'Multiple medications', desc: 'Learner is on more than one anti-epileptic drug' },
  { value: 'No medication', label: 'No medication', desc: 'Not currently on any anti-epileptic medication' },
  { value: 'Unknown', label: 'Unknown', desc: 'Medication details not available' },
]

const triggers = [
  { value: 'Stress and anxiety', label: 'Stress and anxiety', desc: 'Exams, conflicts, emotional pressure' },
  { value: 'Sleep deprivation', label: 'Sleep deprivation', desc: 'Too little or disrupted sleep' },
  { value: 'Flashing or flickering lights', label: 'Flashing or flickering lights', desc: 'Screens, strobe effects, sunlight through trees' },
  { value: 'Missed medication', label: 'Missed medication', desc: 'Skipping anti-epileptic doses' },
  { value: 'Fever or illness', label: 'Fever or illness', desc: 'High temperature or infections' },
  { value: 'Dehydration or skipped meals', label: 'Dehydration or skipped meals', desc: 'Low blood sugar or dehydration' },
  { value: 'Overheating or physical exhaustion', label: 'Overheating or physical exhaustion', desc: 'During PE or sports activities' },
  { value: 'Hormonal changes', label: 'Hormonal changes', desc: 'Puberty related changes' },
  { value: 'Multiple triggers', label: 'Multiple triggers', desc: 'More than one known trigger' },
  { value: 'Unknown triggers', label: 'Unknown triggers', desc: 'Triggers not yet identified' },
]

const grades = ['Grade 7','Grade 8','Grade 9','Grade 10','Grade 11','Grade 12','Grade 13']

const actionSteps = [
  'Stay calm and stay with the learner',
  'Note the time the seizure starts',
  'Clear area of hard or sharp objects',
  "Cushion the learner's head gently",
  'Do NOT restrain the learner',
  'Place in recovery position after convulsions stop',
  'Call emergency contact if seizure exceeds 5 minutes',
  'Call 114 (ambulance) if first seizure or no recovery',
  'Reassure learner when they regain awareness',
  'Record duration and type of movements',
]

const schoolsByZone = {
  'Zone 1': ['Adolphe de Plevitz SSS','James Burty David SSS','Droopnath Ramphul State College','Frank Richard SSS','Goodlands SSS','Lady Sushil Ramgoolam SSS','Pailles SSS','Pamplemousses SSS','Piton SC','Port Louis North SSS','Port Louis SSS','G. M. Dawjee Atchia State College','Prof. Hassan Raffa SSS','Rabindranath Tagore SSS','Ramsoondur Prayag SSS','R. Seeneevassen SSS','Riviere du Rempart SSS','Royal College Port Louis','Sharma Jugdambi SSS','Shri Beekrumsingh Ramlallah SSS','Sir A. R. Mohamed SSS','Terre Rouge SSS','Triolet SSS','Alpha College','Bhujoharry College','BPS Fatima College','Bradley College','College Ideal','College Pere Laval','Cosmopolitain College','DAV HSC College','DAV College','Labourdonnais College','Friendship College (Boys)','Friendship College (Girls)','International College','Islamic Cultural College','Islamic Cultural Form VI College','London College','Loreto College Port Louis','Madad Ul Islam Girls College','Merton College','Muslim Girls College','Pamplemousses High School','Port Louis High School','S Munrakhun College',"Saint Bartholomew's College",'Universal College'],
  'Zone 2': ['Beau Bassin SSS','Bel Air Riviere Seche SSS','Bon Accueil State College','Camp de Masque State College','Ebene SSS (Boys)','Ebene SSS (Girls)','John Kennedy College','Mahatma Gandhi Institute','Mahatma Gandhi SS Centre de Flacq','Mahatma Gandhi SS Moka','Manilall Doctor SSS','Marcel Cabon SSS','Quartier Militaire SSS','Queen Elizabeth College','Rajcoomar Gujadhur SSS','Sebastopol SSS','Shrimati Indira Gandhi SSS','Sir Leckraz Teelock SSS','Byron College','La Confiance College','College des Ville Soeurs','Loreto College Rose Hill','Rose Hill Muslim College','Royal College Curepipe','Royal College Beau Bassin',"St Andrew's College",'St Joseph College',"St Mary's College",'Vieux Grand Port SSS','Sodnac SSS'],
  'Zone 3': ['Curepipe College','Bel Ombre SSS','Chemin Grenier SSS','Henrietta SSS','Mahebourg SSS',"Mare d'Albert SSS",'New Eben Ezer SSS','Phoenix SSS','Plaine Magnien SSS','Riviere des Anguilles State College','Rose Belle SSS','Sookdeo Bissoondoyal State College','Stanley College','Surinam SSS','Tyack SSS','Wooton SSS','Loreto College Curepipe','St Gabriel College','St Esprit College','Sodnac College','Nouvelle France College','Savanne College','Grand Bois College'],
  'Zone 4': ['Bambous SSS','Cascades SSS','Ecole du Centre SSS','Floreal SSS','Forest Side SSS','Quatre Bornes SSS','Royal College Rose Hill','Vacoas SSS','Highlands College','Belle Rose SSS','Tamarin SSS','Black River SSS','Flic en Flac SSS','Petite Riviere SSS','Dr Regis Chaperon SSS','Loreto College Quatre Bornes','St Andrews College','Clavis College','Savannah College'],
}

function Registry() {
  const [learners, setLearners] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedZone, setSelectedZone] = useState('')
  const [selectedActions, setSelectedActions] = useState([...actionSteps])
  const [form, setForm] = useState({
    full_name: '', grade: '', class: '', seizure_type: '',
    medication: '', triggers: '', emergency_contact_name: '',
    emergency_contact_phone: '', action_plan: '', status: 'active'
  })

  useEffect(() => { fetchLearners() }, [])

  async function fetchLearners() {
    setLoading(true)
    const { data } = await supabase.from('learners').select('*').order('created_at', { ascending: false })
    setLearners(data || [])
    setLoading(false)
  }

  function toggleAction(step) {
    setSelectedActions(prev =>
      prev.includes(step) ? prev.filter(s => s !== step) : [...prev, step]
    )
  }

  async function handleSubmit() {
    if (!form.full_name) return alert('Please enter learner name')
    const finalForm = { ...form, action_plan: selectedActions.join(' | ') }
    const { error } = await supabase.from('learners').insert([finalForm])
    if (error) {
      alert('Error saving: ' + error.message)
    } else {
      setForm({ full_name: '', grade: '', class: '', seizure_type: '', medication: '', triggers: '', emergency_contact_name: '', emergency_contact_phone: '', action_plan: '', status: 'active' })
      setSelectedZone('')
      setSelectedActions([...actionSteps])
      setShowForm(false)
      fetchLearners()
    }
  }

  async function deleteLearner(id) {
    if (!confirm('Are you sure?')) return
    await supabase.from('learners').delete().eq('id', id)
    fetchLearners()
  }

  function printLearner(l) {
    const win = window.open('', '_blank')
    win.document.write(`
      <html><head><title>Seizure Action Plan - ${l.full_name}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
        h1 { color: #1a1a2e; } h2 { color: #3ECF8E; margin-top: 24px; }
        .info { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin: 16px 0; }
        .info div { padding: 8px 12px; background: #f5f5f5; border-radius: 6px; }
        .label { font-size: 11px; color: #888; } .value { font-weight: 500; }
        .step { padding: 8px 12px; margin: 4px 0; background: #e6fff5; border-radius: 6px; border-left: 3px solid #3ECF8E; }
        .footer { margin-top: 40px; font-size: 12px; color: #aaa; border-top: 1px solid #eee; padding-top: 12px; }
      </style></head><body>
      <h1>🧠 EpiSafe School — Seizure Action Plan</h1>
      <h2>Learner Details</h2>
      <div class="info">
        <div><div class="label">Full Name</div><div class="value">${l.full_name || '—'}</div></div>
        <div><div class="label">Grade</div><div class="value">${l.grade || '—'}</div></div>
        <div><div class="label">Gender</div><div class="value">${l.class || '—'}</div></div>
        <div><div class="label">Seizure Type</div><div class="value">${l.seizure_type || '—'}</div></div>
        <div><div class="label">Medication</div><div class="value">${l.medication || '—'}</div></div>
        <div><div class="label">Triggers</div><div class="value">${l.triggers || '—'}</div></div>
        <div><div class="label">Emergency Contact</div><div class="value">${l.emergency_contact_name || '—'}</div></div>
        <div><div class="label">Emergency Phone</div><div class="value">${l.emergency_contact_phone || '—'}</div></div>
      </div>
      <h2>Action Steps for Staff</h2>
      ${(l.action_plan || '').split(' | ').map((s, i) => `<div class="step"><strong>${i + 1}.</strong> ${s}</div>`).join('')}
      <div class="footer">Generated by EpiSafe School — Epilepsy management for Mauritian schools</div>
      </body></html>
    `)
    win.document.close()
    win.print()
  }

  const badgeClass = s => s === 'active' ? 'badge badge-green' : s === 'review' ? 'badge badge-amber' : 'badge badge-red'
  const selectedSeizure = seizureTypes.find(s => s.value === form.seizure_type)
  const selectedMed = medications.find(m => m.value === form.medication)
  const selectedTrigger = triggers.find(t => t.value === form.triggers)
  const schoolList = selectedZone ? schoolsByZone[selectedZone] : []
  const filteredLearners = learners.filter(l =>
    l.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    l.grade?.toLowerCase().includes(search.toLowerCase()) ||
    l.seizure_type?.toLowerCase().includes(search.toLowerCase())
  )

  const vulnColors = { High: '#ff4d4f', Moderate: '#fa8c16', 'Low-Moderate': '#fadb14', Low: '#3ECF8E' }
  const vulnScores = { High: 9, Moderate: 6, 'Low-Moderate': 4, Low: 2 }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1>👥 Learner Registry</h1>
          <p>Confirmed epilepsy cases and seizure action plans</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '➕ Add Learner'}
        </button>
      </div>

      {showForm && (
        <div className="card">
          <h2>New Learner</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
            <div className="form-group">
              <label>Full Name *</label>
              <input value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} placeholder="Full name" />
            </div>
            <div className="form-group">
              <label>Gender</label>
              <select value={form.class} onChange={e => setForm({ ...form, class: e.target.value })}>
                <option value="">-- Select gender --</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            <div className="form-group">
              <label>Grade</label>
              <select value={form.grade} onChange={e => setForm({ ...form, grade: e.target.value })}>
                <option value="">-- Select grade --</option>
                {grades.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Status</label>
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                <option value="active">Active — Plan in place</option>
                <option value="review">Needs Review</option>
                <option value="pending">Pending Evaluation</option>
              </select>
            </div>
            <div className="form-group">
              <label>Zone</label>
              <select value={selectedZone} onChange={e => setSelectedZone(e.target.value)}>
                <option value="">-- Select zone first --</option>
                <option value="Zone 1">Zone 1 — Port Louis & North</option>
                <option value="Zone 2">Zone 2 — East & Central</option>
                <option value="Zone 3">Zone 3 — South & South East</option>
                <option value="Zone 4">Zone 4 — West & Highlands</option>
              </select>
            </div>
            <div className="form-group">
              <label>School Name</label>
              <select value={form.emergency_contact_phone} onChange={e => setForm({ ...form, emergency_contact_phone: e.target.value })} disabled={!selectedZone}>
                <option value="">{selectedZone ? '-- Select school --' : '-- Select zone first --'}</option>
                {schoolList.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Seizure Type</label>
            <select value={form.seizure_type} onChange={e => setForm({ ...form, seizure_type: e.target.value })}>
              <option value="">-- Select seizure type --</option>
              {seizureTypes.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
            {selectedSeizure && (
              <div style={{ background: '#e6fff5', padding: '8px 12px', borderRadius: '6px', fontSize: '13px', color: '#0F6E56', marginTop: '-8px', marginBottom: '12px' }}>
                ℹ️ {selectedSeizure.desc}
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Current Medication</label>
            <select value={form.medication} onChange={e => setForm({ ...form, medication: e.target.value })}>
              <option value="">-- Select medication --</option>
              {medications.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
            {selectedMed && (
              <div style={{ background: '#e6f1fb', padding: '8px 12px', borderRadius: '6px', fontSize: '13px', color: '#185FA5', marginTop: '-8px', marginBottom: '12px' }}>
                ℹ️ {selectedMed.desc}
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Known Triggers</label>
            <select value={form.triggers} onChange={e => setForm({ ...form, triggers: e.target.value })}>
              <option value="">-- Select main trigger --</option>
              {triggers.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
            {selectedTrigger && (
              <div style={{ background: '#fffbe6', padding: '8px 12px', borderRadius: '6px', fontSize: '13px', color: '#854F0B', marginTop: '-8px', marginBottom: '12px' }}>
                ℹ️ {selectedTrigger.desc}
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
            <div className="form-group">
              <label>Emergency Contact Name</label>
              <input value={form.emergency_contact_name} onChange={e => setForm({ ...form, emergency_contact_name: e.target.value })} placeholder="Parent/Guardian name" />
            </div>
            <div className="form-group">
              <label>Emergency Contact Phone</label>
              <input value={form.emergency_contact_phone} onChange={e => setForm({ ...form, emergency_contact_phone: e.target.value })} placeholder="Phone number" />
            </div>
          </div>

          <div className="form-group">
            <label style={{ marginBottom: '10px', display: 'block' }}>Seizure Action Plan</label>
            <p style={{ fontSize: '13px', color: '#666', marginBottom: '12px' }}>Tick all steps that apply for this learner.</p>
            {actionSteps.map((step, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', marginBottom: '6px', background: selectedActions.includes(step) ? '#e6fff5' : '#f9f9f9', borderRadius: '8px', border: selectedActions.includes(step) ? '1px solid #3ECF8E' : '1px solid #eee', cursor: 'pointer' }} onClick={() => toggleAction(step)}>
                <div style={{ width: '20px', height: '20px', borderRadius: '4px', background: selectedActions.includes(step) ? '#3ECF8E' : '#ddd', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {selectedActions.includes(step) && <span style={{ color: 'white', fontSize: '14px' }}>✓</span>}
                </div>
                <span style={{ fontSize: '13px', color: '#333' }}><strong>{i + 1}.</strong> {step}</span>
              </div>
            ))}
          </div>

          <button className="btn btn-primary" style={{ marginTop: '16px' }} onClick={handleSubmit}>Save Learner</button>
        </div>
      )}

      <div className="card">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Search by name, grade or seizure type..." style={{ marginBottom: '16px' }} />
        {loading ? <p>Loading...</p> : filteredLearners.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '40px', color: '#aaa' }}>
            {search ? 'No learners found matching your search.' : 'No learners in registry yet.'}
          </p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th><th>Grade</th><th>Seizure Type</th><th>Vulnerability</th><th>Emergency Contact</th><th>Status</th><th></th>
              </tr>
            </thead>
            <tbody>
              {filteredLearners.map(l => {
                const vulnLevel = l.action_plan && vulnColors[l.action_plan] ? l.action_plan : null
                return (
                  <tr key={l.id}>
                    <td><strong>{l.full_name}</strong></td>
                    <td>{l.grade}</td>
                    <td>{l.seizure_type || '—'}</td>
                    <td>
                      {vulnLevel ? (
                        <span style={{ background: vulnColors[vulnLevel] + '22', color: vulnColors[vulnLevel], border: `1px solid ${vulnColors[vulnLevel]}44`, borderRadius: '20px', padding: '2px 10px', fontSize: '12px', fontWeight: '600' }}>
                          {vulnLevel} ({vulnScores[vulnLevel]}/10)
                        </span>
                      ) : '—'}
                    </td>
                    <td>{l.emergency_contact_name}<br /><small style={{ color: '#888' }}>{l.emergency_contact_phone}</small></td>
                    <td><span className={badgeClass(l.status)}>{l.status}</span></td>
                    <td style={{ display: 'flex', gap: '6px' }}>
                      <button className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '12px' }} onClick={() => printLearner(l)}>🖨️ Print</button>
                      <button className="btn btn-danger" style={{ padding: '4px 10px', fontSize: '12px' }} onClick={() => deleteLearner(l.id)}>Remove</button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default Registry