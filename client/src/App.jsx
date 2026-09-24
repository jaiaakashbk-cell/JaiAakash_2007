import { useEffect, useMemo, useState } from 'react'
import './App.css'

const companies = ['HCLTech', 'TCS', 'Wipro', 'Infosys']
const initialForm = { studentName: '', rollNo: '', bloodGroup: '', phone: '', email: '', address: '', department: '', course: '', gender: '', year: '', section: '', backlogs: '0', company: '' }
function App() {
  const [activeView, setActiveView] = useState('register')
  const [step, setStep] = useState(1)
  const [form, setForm] = useState(initialForm)
  const [registrations, setRegistrations] = useState([])
  const [submitted, setSubmitted] = useState(false)
  const [search, setSearch] = useState('')
  const [apiError, setApiError] = useState('')

  useEffect(() => {
    fetch('/api/registrations')
      .then((response) => {
        if (!response.ok) throw new Error('Could not load registrations')
        return response.json()
      })
      .then(setRegistrations)
      .catch(() => setApiError('Backend is unavailable. Start the server on port 5000.'))
  }, [])
  const groupedRegistrations = useMemo(() => companies.map((company) => ({ company, students: registrations.filter((registration) => registration.company === company && `${registration.studentName} ${registration.rollNo}`.toLowerCase().includes(search.toLowerCase())) })), [registrations, search])
  const updateField = (event) => { const { name, value } = event.target; setForm((current) => ({ ...current, [name]: value })); setSubmitted(false) }
  const handleDetailsSubmit = (event) => { event.preventDefault(); if (Number(form.backlogs) === 0) setStep(2); else setSubmitted(true) }
  const handleRegistration = async (event) => {
    event.preventDefault()
    if (!form.company) return
    setApiError('')
    try {
      const response = await fetch('/api/registrations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'Could not save registration')
      setRegistrations((current) => [data, ...current])
      setForm(initialForm)
      setStep(1)
      setSubmitted(true)
    } catch (error) {
      setApiError(error.message)
    }
  }
  const changeView = (view) => { setActiveView(view); setSubmitted(false) }

  return (
    <div className="app-shell">
      <header className="topbar"><div className="brand"><span className="brand-mark">N</span><span>Northstar <b>Campus</b></span></div><nav className="nav-tabs" aria-label="Main navigation"><button className={activeView === 'register' ? 'nav-active' : ''} onClick={() => changeView('register')}>Student registration</button><button className={activeView === 'admin' ? 'nav-active' : ''} onClick={() => changeView('admin')}>Admin view</button></nav><div className="live-status"><span></span> Intake open</div></header>
      <main>{apiError && <p className="error-message api-error">{apiError}</p>}{activeView === 'register' ? <section className="register-layout"><div className="intro"><p className="eyebrow">2025-26 placement intake</p><h1>Your next chapter<br /><em>starts here.</em></h1><p className="intro-copy">Register your academic profile to be considered for opportunities with our hiring partners.</p><div className="process"><div className="process-line"></div><div className={step === 1 ? 'process-step active' : 'process-step'}><strong>01</strong><span>Student details</span></div><div className={step === 2 ? 'process-step active' : 'process-step'}><strong>02</strong><span>Company preference</span></div></div><div className="note"><span>✦</span><p><b>One profile, four possibilities.</b><br />Students with zero backlogs can select their preferred company after completing their profile.</p></div></div><div className="form-card"><div className="card-heading"><div><p className="eyebrow">Step {step} of 2</p><h2>{step === 1 ? 'Tell us about yourself' : 'Choose your path'}</h2></div><span className="step-count">0{step}</span></div>{step === 1 ? <form onSubmit={handleDetailsSubmit}><div className="field-grid"><label className="wide">Student name<input required name="studentName" value={form.studentName} onChange={updateField} placeholder="e.g. Ananya Sharma" /></label><label>Roll number<input required name="rollNo" value={form.rollNo} onChange={updateField} placeholder="e.g. 21CSE104" /></label><label>Blood group<select required name="bloodGroup" value={form.bloodGroup} onChange={updateField}><option value="">Select</option><option>A+</option><option>A-</option><option>B+</option><option>B-</option><option>AB+</option><option>AB-</option><option>O+</option><option>O-</option></select></label><label>Phone number<input required name="phone" type="tel" pattern="[0-9]{10}" value={form.phone} onChange={updateField} placeholder="10-digit number" /></label><label>Email address<input required name="email" type="email" value={form.email} onChange={updateField} placeholder="you@university.edu" /></label><label className="wide">Address<textarea required name="address" value={form.address} onChange={updateField} placeholder="Your current address" rows="2"></textarea></label><label>Department<select required name="department" value={form.department} onChange={updateField}><option value="">Select department</option><option>Computer Science & Engineering</option><option>Electronics & Communication</option><option>Mechanical Engineering</option><option>Electrical Engineering</option><option>Civil Engineering</option></select></label><label>Course<input required name="course" value={form.course} onChange={updateField} placeholder="e.g. B.Tech" /></label><label>Gender<select required name="gender" value={form.gender} onChange={updateField}><option value="">Select</option><option>Female</option><option>Male</option><option>Non-binary</option><option>Prefer not to say</option></select></label><label>Year<select required name="year" value={form.year} onChange={updateField}><option value="">Select</option><option>1st year</option><option>2nd year</option><option>3rd year</option><option>4th year</option></select></label><label>Section<input required name="section" value={form.section} onChange={updateField} placeholder="e.g. A" /></label><label>Number of backlogs<input required min="0" name="backlogs" type="number" value={form.backlogs} onChange={updateField} /></label></div>{submitted && Number(form.backlogs) > 0 && <p className="error-message">Company selection is available only for students with zero backlogs.</p>}<button className="primary-button" type="submit">Continue to company preference <span>→</span></button></form> : <form onSubmit={handleRegistration}><p className="selection-copy">Your profile is complete. Select one company you would like to be considered for.</p><div className="company-grid">{companies.map((company, index) => <label className={form.company === company ? 'company-option selected' : 'company-option'} key={company}><input required type="radio" name="company" value={company} checked={form.company === company} onChange={updateField} /><span className={`company-logo logo-${index}`}>{company.slice(0, 1)}</span><span><b>{company}</b><small>{['Digital & consulting', 'Technology services', 'IT services', 'Digital solutions'][index]}</small></span><i>↗</i></label>)}</div><div className="button-row"><button type="button" className="secondary-button" onClick={() => setStep(1)}>← Back</button><button className="primary-button" type="submit">Submit registration <span>→</span></button></div></form>}{submitted && step === 1 && Number(form.backlogs) === 0 && <p className="success-message">Registration submitted successfully. Your profile is ready for company matching.</p>}</div></section> : <section className="admin-view"><div className="admin-heading"><div><p className="eyebrow">Placement office</p><h1>Registration overview</h1><p>Review student profiles, organised by their preferred company.</p></div><div className="total-stat"><strong>{registrations.length}</strong><span>Total registrations</span></div></div><div className="admin-toolbar"><div className="search-box">⌕<input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name or roll number" /></div><span>Updated live from student intake</span></div><div className="company-columns">{groupedRegistrations.map(({ company, students }) => <section className="company-column" key={company}><div className="company-header"><div><span className="company-badge">{company.slice(0, 1)}</span><h2>{company}</h2></div><strong>{students.length.toString().padStart(2, '0')}</strong></div>{students.length ? students.map((student) => <article className="student-row" key={student._id || student.id}><div className="avatar">{student.studentName.split(' ').map((part) => part[0]).join('').slice(0, 2)}</div><div><b>{student.studentName}</b><span>{student.rollNo} · {student.department}</span></div><button title="View student details" onClick={() => window.alert(`${student.studentName}\n${student.email}\n${student.phone}`)}>···</button></article>) : <div className="empty-column">No registrations yet</div>}</section>)}</div></section>}</main><footer><span>Northstar Campus</span><span>Student placement portal · Secure intake</span></footer>
    </div>
  )
}

export default App
