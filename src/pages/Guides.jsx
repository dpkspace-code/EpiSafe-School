import { useState } from 'react'

const guides = [
  { id: 1, title: '🚨 Seizure First Aid', summary: 'Step-by-step response during a seizure', color: '#e6fff5', steps: ['Stay calm and stay with the learner throughout the seizure.','Note the exact time the seizure starts.','Clear the area of hard or sharp objects that could cause injury.','Gently cushion the learner\'s head with something soft.','Do NOT restrain the learner — let the seizure run its course.','Place the learner in the recovery position once convulsions stop.','Talk calmly and reassure the learner when they regain awareness.','Record duration, type of movements, and anything unusual.'] },
  { id: 2, title: '🚫 What NOT To Do', summary: 'Common dangerous mistakes to avoid', color: '#fff1f0', steps: ['Do NOT put anything in the learner\'s mouth.','Do NOT hold the learner down or restrain their movements.','Do NOT give food, water, or medication during a seizure.','Do NOT leave the learner alone until fully alert.','Do NOT assume the seizure will stop — call emergency if it exceeds 5 minutes.','Do NOT use cold water or ice to try to stop the seizure.'] },
  { id: 3, title: '🚑 When To Call Emergency Services', summary: 'Know when to escalate immediately', color: '#fff7e6', steps: ['The seizure lasts longer than 5 minutes.','A second seizure begins immediately after the first.','The learner does not regain consciousness after the seizure.','The learner is not breathing after the seizure ends.','The learner is injured during the seizure.','This is the learner\'s first ever known seizure.'] },
  { id: 4, title: '🧠 Types of Seizures', summary: 'Recognise different presentations', color: '#f0f0ff', steps: ['Tonic-clonic: body stiffens then jerks rhythmically. Person may fall and lose consciousness.','Absence: brief blank stare, unresponsive for a few seconds. Often mistaken for daydreaming.','Focal: affects one part of the body. Learner may stay conscious but appear confused.','Atonic: sudden loss of muscle tone causing the person to fall without warning.','Myoclonic: sudden brief muscle jerks, often in the arms or upper body.'] },
  { id: 5, title: '⚠️ Triggers & Prevention', summary: 'Reduce seizure risk at school', color: '#fffbe6', steps: ['Missed medication — ensure learners take medication on schedule.','Sleep deprivation — communicate with parents about sleep routines.','Stress and anxiety — identify high-pressure periods and provide support.','Flashing lights — check visual media for photosensitive learners.','Dehydration and skipped meals — encourage regular food and water intake.','Overheating during PE — allow rest breaks and monitor the learner.'] },
  { id: 6, title: '💬 Supporting Learners', summary: 'Reduce stigma and support peers', color: '#fff0f6', steps: ['Talk to the learner privately about their condition.','With consent, inform classmates to reduce fear.','Avoid treating the learner as fragile — include them in activities.','Ensure teachers do not use language that shames the learner.','Debrief classmates calmly after a witnessed seizure.','Encourage the learner to wear a medical alert bracelet.'] },
]

function Guides() {
  const [selected, setSelected] = useState(null)

  if (selected) {
    const guide = guides.find(g => g.id === selected)
    return (
      <div>
        <button className="btn btn-secondary" style={{ marginBottom: '20px' }} onClick={() => setSelected(null)}>← Back to Guides</button>
        <h1>{guide.title}</h1>
        <p style={{ marginBottom: '24px' }}>{guide.summary}</p>
        <div className="card">
          {guide.steps.map((step, i) => (
            <div key={i} style={{ display: 'flex', gap: '14px', marginBottom: '16px', alignItems: 'flex-start' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#3ECF8E', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '600', flexShrink: 0 }}>{i + 1}</div>
              <p style={{ color: '#333', lineHeight: '1.6', paddingTop: '4px' }}>{step}</p>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1>📖 Staff Guides</h1>
      <p style={{ marginBottom: '24px' }}>Essential knowledge for managing epilepsy at school</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
        {guides.map(g => (
          <div key={g.id} className="card" style={{ background: g.color, cursor: 'pointer' }} onClick={() => setSelected(g.id)}>
            <h2 style={{ marginBottom: '8px' }}>{g.title}</h2>
            <p>{g.summary}</p>
            <p style={{ color: '#3ECF8E', marginTop: '12px', fontWeight: '500' }}>Read guide →</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Guides