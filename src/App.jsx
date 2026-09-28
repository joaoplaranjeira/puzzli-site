import { useEffect, useRef, useState } from 'react'
import DriverPage from './DriverPage.jsx'

const OTP_API = 'https://otw-puzzli-api-authentication-4e86ebc4ed92.herokuapp.com/api/Otp'

function Icon({ name, className }) {
  const common = { className, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2 }
  const paths = {
    car: <><path d="M5 17H3c-1.1 0-2-.9-2-2V8c0-1.1.9-2 2-2h2"/><path d="M7 17h10M21 17h-2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/><path d="m5 6 1.5-2.5C7 2.8 7.8 2 8.7 2h6.6c.9 0 1.7.8 2.2 1.5L19 6"/><path d="M5 6h14c1.1 0 2 .9 2 2v7c0 1.1-.9 2-2 2h-2"/></>,
    plane: <path strokeLinecap="round" strokeLinejoin="round" d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2Z"/>,
    calendar: <><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><path d="M16 2v4M8 2v4M3 10h18"/></>,
    phone: <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92Z"/>,
    mail: <><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 6-10 7L2 6"/></>,
    pin: <><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0Z"/><circle cx="12" cy="10" r="3"/></>,
    start: <><circle cx="12" cy="10" r="3"/><path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 7 8 11.7Z"/></>,
    clock: <><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></>,
    users: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></>,
  }
  return <svg {...common}>{paths[name]}</svg>
}

function AddressInput({ id, label, icon, placeholder, value, onChange }) {
  const [results, setResults] = useState([])
  const [activeIndex, setActiveIndex] = useState(-1)
  const [isOpen, setIsOpen] = useState(false)
  const wrapperRef = useRef(null)
  const skipNextSearch = useRef(false)

  useEffect(() => {
    if (skipNextSearch.current) {
      skipNextSearch.current = false
      return undefined
    }
    if (value.trim().length < 3) {
      setResults([])
      setIsOpen(false)
      return undefined
    }
    const controller = new AbortController()
    const timer = window.setTimeout(async () => {
      try {
        const params = new URLSearchParams({ format: 'json', addressdetails: '1', limit: '5', countrycodes: 'pt', q: value.trim() })
        const response = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, { headers: { 'Accept-Language': 'pt' }, signal: controller.signal })
        if (!response.ok) throw new Error('Não foi possível pesquisar moradas.')
        const places = await response.json()
        setResults(places)
        setActiveIndex(-1)
        setIsOpen(places.length > 0)
      } catch (error) {
        if (error.name !== 'AbortError') setIsOpen(false)
      }
    }, 350)
    return () => { window.clearTimeout(timer); controller.abort() }
  }, [value])

  useEffect(() => {
    const closeOnOutsideClick = (event) => { if (!wrapperRef.current?.contains(event.target)) setIsOpen(false) }
    document.addEventListener('mousedown', closeOnOutsideClick)
    return () => document.removeEventListener('mousedown', closeOnOutsideClick)
  }, [])

  const choose = (place) => {
    skipNextSearch.current = true
    onChange(place.display_name)
    setIsOpen(false)
  }
  const handleKeyDown = (event) => {
    if (!isOpen || results.length === 0) return
    if (event.key === 'ArrowDown') { event.preventDefault(); setActiveIndex((index) => Math.min(index + 1, results.length - 1)) }
    else if (event.key === 'ArrowUp') { event.preventDefault(); setActiveIndex((index) => Math.max(index - 1, 0)) }
    else if (event.key === 'Enter' && activeIndex >= 0) { event.preventDefault(); choose(results[activeIndex]) }
    else if (event.key === 'Escape') setIsOpen(false)
  }

  return <div className="form-group">
    <label htmlFor={id}><Icon name={icon} className="input-icon"/>{label}</label>
    <div className="autocomplete-wrapper" ref={wrapperRef}>
      <input id={id} type="text" required autoComplete="off" placeholder={placeholder} value={value} onChange={(event) => onChange(event.target.value)} onFocus={() => results.length > 0 && setIsOpen(true)} onKeyDown={handleKeyDown} aria-autocomplete="list" aria-expanded={isOpen} aria-controls={`${id}-options`}/>
      {isOpen && <ul id={`${id}-options`} className="autocomplete-list" role="listbox">
        {results.map((place, index) => {
          const [name, ...detail] = place.display_name.split(',')
          return <li key={place.place_id} className={index === activeIndex ? 'active' : ''} onMouseDown={(event) => event.preventDefault()} onClick={() => choose(place)} role="option" aria-selected={index === activeIndex}>
            <span className="place-name">{name.trim()}</span><span className="place-detail">{detail.slice(0, 3).join(',').trim()}</span>
          </li>
        })}
      </ul>}
    </div>
  </div>
}

function Modal({ children, onClose, className = '' }) {
  useEffect(() => {
    const closeOnEscape = (event) => event.key === 'Escape' && onClose()
    document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [onClose])
  return <div className="modal modal-open" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
    <div className={`modal-content ${className}`} role="dialog" aria-modal="true">
      <button type="button" className="close" onClick={onClose} aria-label="Fechar">&times;</button>{children}
    </div>
  </div>
}

function HomePage() {
  const emptyForm = { from: '', to: '', date: '', time: '', passengers: '1' }
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [booking, setBooking] = useState(null)
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [bookingRef, setBookingRef] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const openBooking = () => {
    const now = new Date(); now.setHours(now.getHours() + 1)
    setForm((current) => ({ ...current, time: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}` }))
    setModal('booking')
  }
  const scrollTo = (event, id) => {
    event.preventDefault()
    const target = document.querySelector(id); const navbar = document.querySelector('.navbar')
    if (target) window.scrollTo({ top: target.offsetTop - navbar.offsetHeight, behavior: 'smooth' })
    setMobileMenuOpen(false)
  }
  const updateForm = (field, value) => setForm((current) => ({ ...current, [field]: value }))
  const submitBooking = (event) => {
    event.preventDefault()
    const distance = Math.floor(Math.random() * 40) + 10
    setBooking({ ...form, serviceType: 'standard', distance, price: Math.max(distance * 1.5, 5).toFixed(2) })
    setModal('summary')
  }

  const requestOtp = async () => {
    const emailInput = document.getElementById('userEmail')
    if (!email || !emailInput?.checkValidity()) { window.alert('Por favor, insira um email válido.'); return }
    setIsSubmitting(true)
    try {
      const response = await fetch(`${OTP_API}/send`, { method: 'POST', mode: 'cors', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ email }) })
      if (!response.ok) throw new Error('Erro ao enviar código OTP')
      window.alert(`Código OTP enviado para ${email}!`); setModal('otp')
    } catch (error) {
      console.error('Error sending OTP:', error); window.alert('Erro ao enviar código. Por favor, tente novamente.')
    } finally { setIsSubmitting(false) }
  }

  const confirmBooking = () => {
    const reference = `PZL${Date.now().toString().slice(-8)}`
    const confirmedBooking = { ...booking, reference, email, confirmedAt: new Date().toISOString() }
    const bookings = JSON.parse(localStorage.getItem('puzzliBookings') || '[]')
    localStorage.setItem('puzzliBookings', JSON.stringify([...bookings, confirmedBooking]))
    setBookingRef(reference); setOtp(''); setModal('success')
  }
  const verifyOtp = async () => {
    if (!/^\d{6}$/.test(otp)) { window.alert('Por favor, insira um código de 6 dígitos.'); return }
    setIsSubmitting(true)
    try {
      const response = await fetch(`${OTP_API}/validate`, { method: 'POST', mode: 'cors', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ email, code: otp }) })
      const result = await response.json()
      if (response.ok && result.success) confirmBooking(); else setOtp('')
    } catch (error) { console.error('Error validating OTP:', error); setOtp('') }
    finally { setIsSubmitting(false) }
  }
  const closeSuccess = () => { setModal(null); setForm(emptyForm); setBooking(null); setEmail(''); setOtp('') }

  const minDate = new Date().toLocaleDateString('en-CA')
  const formattedDate = booking ? new Date(`${booking.date}T00:00:00`).toLocaleDateString('pt-PT', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : ''

  return <>
    <nav className="navbar" style={{ boxShadow: scrolled ? '0 4px 20px rgba(0,0,0,0.2)' : undefined }}>
      <div className="container"><div className="nav-content">
        <div className="logo">Puzzli<span>.</span></div>
        <div className="nav-links" style={mobileMenuOpen ? { display: 'flex' } : undefined}>
          <a href="#home" onClick={(event) => scrollTo(event, '#home')}>Início</a><a href="#services" onClick={(event) => scrollTo(event, '#services')}>Serviços</a><a href="#contact" onClick={(event) => scrollTo(event, '#contact')}>Contactos</a><button className="btn-primary" type="button" onClick={openBooking}>Reservar Viagem</button>
        </div>
        <button className="mobile-menu-btn" type="button" onClick={() => setMobileMenuOpen((open) => !open)} aria-label="Abrir menu" aria-expanded={mobileMenuOpen}><span/><span/><span/></button>
      </div></div>
    </nav>

    <section id="home" className="hero"><div className="container"><div className="hero-content">
      <h1>Vá para qualquer lugar com Puzzli</h1><p>O seu transporte privado, quando e como precisar. Rápido, seguro e sempre disponível.</p><button className="btn-hero" type="button" onClick={openBooking}>Reservar Agora</button>
    </div></div></section>

    <section id="services" className="services"><div className="container"><h2>Como podemos ajudar</h2><div className="services-grid">
      {[
        ['car', 'Viagens Urbanas', 'Deslocações rápidas e confortáveis pela cidade'],
        ['plane', 'Aeroporto', 'Transfers para aeroportos com pontualidade garantida'],
        ['calendar', 'Viagens Programadas', 'Agende suas viagens com antecedência'],
      ].map(([icon, title, text]) => <div className="service-card" key={title}><div className="service-icon"><Icon name={icon}/></div><h3>{title}</h3><p>{text}</p></div>)}
    </div></div></section>

    <section id="contact" className="contact"><div className="container"><h2>Contactos</h2><div className="contact-grid">
      <div className="contact-card"><div className="contact-icon"><Icon name="phone"/></div><h3>Telefone</h3><p>+351 932 734 483</p></div>
      <div className="contact-card"><div className="contact-icon"><Icon name="mail"/></div><h3>Email</h3><p>geral@puzzli.pt</p></div>
      <div className="contact-card"><div className="contact-icon"><Icon name="pin"/></div><h3>Localização</h3><p>Matosinhos, Portugal</p><p>Disponível 24/7</p></div>
    </div></div></section>

    <footer className="footer"><div className="container"><p>&copy; {new Date().getFullYear()} Puzzli. Todos os direitos reservados.</p><p>Licença TVDE: 230336/2025</p></div></footer>

    {modal === 'booking' && <Modal onClose={() => setModal(null)}><h2>Reservar Viagem</h2>
      <div className="vehicle-info"><div className="vehicle-badge"><Icon name="car"/><div className="vehicle-details"><span className="vehicle-name">BYD Atto 2</span><span className="vehicle-type">Elétrico • Até 4 passageiros</span></div></div></div>
      <form onSubmit={submitBooking}>
        <div className="form-row"><AddressInput id="fromLocation" label="Ponto de partida" icon="start" placeholder="Endereço de partida" value={form.from} onChange={(value) => updateForm('from', value)}/></div>
        <div className="form-row"><AddressInput id="toLocation" label="Destino" icon="pin" placeholder="Endereço de destino" value={form.to} onChange={(value) => updateForm('to', value)}/></div>
        <div className="form-row"><div className="form-group"><label htmlFor="pickupDate"><Icon name="calendar" className="input-icon"/>Data</label><input id="pickupDate" type="date" min={minDate} required value={form.date} onChange={(event) => updateForm('date', event.target.value)}/></div><div className="form-group"><label htmlFor="pickupTime"><Icon name="clock" className="input-icon"/>Hora</label><input id="pickupTime" type="time" required value={form.time} onChange={(event) => updateForm('time', event.target.value)}/></div></div>
        <div className="form-row"><div className="form-group"><label htmlFor="passengers"><Icon name="users" className="input-icon"/>Número de Passageiros</label><input id="passengers" type="number" min="1" max="4" required value={form.passengers} onChange={(event) => updateForm('passengers', event.target.value)}/></div></div>
        <button type="submit" className="btn-primary btn-full">Continuar para Resumo</button>
      </form>
    </Modal>}

    {modal === 'summary' && booking && <Modal onClose={() => setModal(null)}><h2>Resumo da Viagem</h2>
      <div className="summary-content">{[
        ['De:', booking.from], ['Para:', booking.to], ['Data:', formattedDate], ['Hora:', booking.time], ['Viatura:', 'BYD Atto 2'], ['Passageiros:', booking.passengers], ['Distância Estimada:', `${booking.distance} km`],
      ].map(([label, value]) => <div className="summary-item" key={label}><span className="summary-label">{label}</span><span className="summary-value">{value}</span></div>)}<div className="price-display"><div className="price-label">Preço Estimado</div><div className="price-amount">€{booking.price}</div></div></div>
      <div className="form-group"><label htmlFor="userEmail">Email para confirmação</label><input id="userEmail" type="email" required placeholder="seu@email.com" value={email} onChange={(event) => setEmail(event.target.value)}/></div>
      <button type="button" onClick={requestOtp} disabled={isSubmitting} className="btn-primary btn-full">{isSubmitting ? 'A enviar…' : 'Confirmar e Enviar OTP'}</button>
    </Modal>}

    {modal === 'otp' && <Modal onClose={() => setModal(null)}><h2>Verificação de Email</h2><p className="otp-message">Enviámos um código de 6 dígitos para <strong>{email}</strong></p><div className="form-group"><label htmlFor="otpCode">Código OTP</label><input id="otpCode" type="text" inputMode="numeric" maxLength="6" pattern="[0-9]{6}" required placeholder="000000" value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))}/></div><button type="button" onClick={verifyOtp} disabled={isSubmitting} className="btn-primary btn-full">Verificar e Confirmar Reserva</button><button type="button" onClick={requestOtp} disabled={isSubmitting} className="btn-secondary btn-full">Reenviar Código</button></Modal>}

    {modal === 'success' && <Modal onClose={closeSuccess} className="success"><div className="success-icon">✓</div><h2>Pedido Recebido!</h2><p>O seu pedido de reserva foi enviado com sucesso.</p><p className="pending-notice">A confirmação será enviada nos próximos minutos para o seu email.</p><p className="booking-reference">Referência: <strong>{bookingRef}</strong></p><button type="button" onClick={closeSuccess} className="btn-primary btn-full">Fechar</button></Modal>}
  </>
}

function App() {
  const driverRoute = window.location.pathname.match(/^\/motoristas\/([^/]+)\/?$/)
    || window.location.pathname.match(/^\/([^/]+)\/?$/)

  if (driverRoute) {
    let publicSlug
    try {
      publicSlug = decodeURIComponent(driverRoute[1])
    } catch {
      publicSlug = ''
    }
    return <DriverPage publicSlug={publicSlug} />
  }

  return <HomePage />
}

export default App
