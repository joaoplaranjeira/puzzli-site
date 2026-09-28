import { useEffect, useMemo, useState } from 'react'

const API_URL = (import.meta.env.VITE_MANAGEMENT_API_URL || '').replace(/\/$/, '')
const pendingDriverRequests = new Map()

function getPublicDriver(publicSlug) {
  const requestKey = publicSlug.toLowerCase()
  const pendingRequest = pendingDriverRequests.get(requestKey)
  if (pendingRequest) return pendingRequest

  const request = fetch(`${API_URL}/api/public/drivers/${encodeURIComponent(publicSlug)}`, {
    headers: { Accept: 'application/json' },
  }).then((response) => {
    if (response.status === 404) return null
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    return response.json()
  })

  pendingDriverRequests.set(requestKey, request)
  const clearRequest = () => {
    if (pendingDriverRequests.get(requestKey) === request) pendingDriverRequests.delete(requestKey)
  }
  request.then(clearRequest, clearRequest)
  return request
}

const iconPaths = {
  arrow: <><path d="m15 18-6-6 6-6"/><path d="M9 12h11"/></>,
  phone: <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.36 1.79.7 2.61a2 2 0 0 1-.45 2.11L8.09 9.71a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.82.34 1.7.58 2.61.7A2 2 0 0 1 22 16.92Z"/>,
  mail: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></>,
  globe: <><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18"/></>,
  instagram: <><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".5" fill="currentColor" stroke="none"/></>,
  pin: <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></>,
  external: <><path d="M14 4h6v6M20 4l-9 9"/><path d="M18 13v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h5"/></>,
  gift: <><rect x="3" y="9" width="18" height="12" rx="2"/><path d="M12 9v12M3 13h18M7.5 9C5 9 4 7.8 4 6.5S5 4 6.5 4C9 4 12 9 12 9s3-5 5.5-5C19 4 20 5.2 20 6.5S19 9 16.5 9"/></>,
  chevron: <path d="m6 9 6 6 6-6"/>,
  retry: <><path d="M20 7v5h-5"/><path d="M19 12a7 7 0 1 0-2 5"/></>,
  zoom: <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4M11 8v6M8 11h6"/></>,
}

function Icon({ name, className = '' }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{iconPaths[name]}</svg>
}

function safeHttpUrl(value) {
  if (!value) return null
  try {
    const url = new URL(value)
    return ['http:', 'https:'].includes(url.protocol) ? url.href : null
  } catch {
    return null
  }
}

function formatDate(value) {
  if (!value) return null
  const date = new Date(`${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) return null
  return new Intl.DateTimeFormat('pt-PT', { day: 'numeric', month: 'short', year: 'numeric' }).format(date)
}

function ContactLink({ href, icon, children, external = false }) {
  return <a className="driver-contact-link" href={href} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
    <Icon name={icon}/><span>{children}</span>{external && <Icon name="external" className="external-icon"/>}
  </a>
}

function DriverPhoto({ publicSlug, driverName, initials }) {
  const [failed, setFailed] = useState(false)
  const photoUrl = `${API_URL}/api/public/drivers/${encodeURIComponent(publicSlug)}/photo`

  if (failed) {
    return <div className="driver-photo driver-photo-fallback" aria-hidden="true">{initials || 'PZ'}</div>
  }

  return <img
    className="driver-photo"
    src={photoUrl}
    alt={`Fotografia de ${driverName}`}
    decoding="async"
    fetchPriority="high"
    onError={() => setFailed(true)}
  />
}

function PromotionList({ partnershipId, isOpen }) {
  const [state, setState] = useState({ status: 'idle', items: [] })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (!isOpen) return undefined
    const controller = new AbortController()
    setState({ status: 'loading', items: [] })
    fetch(`${API_URL}/api/public/partners/${encodeURIComponent(partnershipId)}/promotions`, {
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        return response.json()
      })
      .then((items) => setState({ status: 'success', items: Array.isArray(items) ? items : [] }))
      .catch((error) => {
        if (error.name !== 'AbortError') setState({ status: 'error', items: [] })
      })
    return () => controller.abort()
  }, [isOpen, partnershipId, attempt])

  if (!isOpen) return null
  if (state.status === 'loading') return <div className="promotion-status"><span className="mini-spinner"/>A carregar promoções…</div>
  if (state.status === 'error') return <div className="promotion-status promotion-error"><span>Não foi possível carregar as promoções.</span><button type="button" onClick={() => setAttempt((value) => value + 1)}><Icon name="retry"/>Tentar novamente</button></div>
  if (state.status === 'success' && state.items.length === 0) return <p className="promotion-status">Não há promoções disponíveis neste momento.</p>

  return <div className="promotion-list">
    {state.items.map((promotion) => {
      const from = formatDate(promotion.validFrom)
      const to = formatDate(promotion.validTo)
      const validity = from && to ? `De ${from} a ${to}` : from ? `Desde ${from}` : to ? `Até ${to}` : null
      return <article className="promotion-item" key={promotion.id}>
        <div className="promotion-gift"><Icon name="gift"/></div>
        <div>
          <p>{promotion.benefitDescription}</p>
          {validity && <span className="promotion-validity">{validity}</span>}
        </div>
        {promotion.promoCode && <div className="promo-code"><span>Código</span><strong>{promotion.promoCode}</strong></div>}
      </article>
    })}
  </div>
}

function PartnerLogoPreview({ logoUrl, partnerName, onClose }) {
  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') onClose()
    }
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [onClose])

  return <div className="logo-lightbox" role="dialog" aria-modal="true" aria-label={`Logótipo de ${partnerName}`} onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
    <div className="logo-lightbox-panel">
      <button type="button" className="logo-lightbox-close" onClick={onClose} aria-label="Fechar imagem ampliada">×</button>
      <div className="logo-lightbox-image-wrap">
        <img src={logoUrl} alt={`Logótipo de ${partnerName}`}/>
      </div>
      <p>{partnerName}</p>
    </div>
  </div>
}

function PartnerCard({ partner }) {
  const [isOpen, setIsOpen] = useState(false)
  const [logoFailed, setLogoFailed] = useState(false)
  const [logoOpen, setLogoOpen] = useState(false)
  const websiteUrl = safeHttpUrl(partner.websiteUrl)
  const mapsUrl = safeHttpUrl(partner.googleMapsUrl)
  const logoUrl = safeHttpUrl(partner.logoUrl)
  const promotionCount = Number(partner.activePromotionCount) || 0

  return <article className={`partner-card ${isOpen ? 'is-open' : ''}`}>
    <div className="partner-card-main">
      {logoUrl && !logoFailed
        ? <button type="button" className="partner-logo-button" onClick={() => setLogoOpen(true)} aria-label={`Ampliar logótipo de ${partner.partnerName}`}>
          <span className="partner-logo-frame"><img className="partner-logo" src={logoUrl} alt="" onError={() => setLogoFailed(true)}/></span>
          <span className="partner-logo-zoom" aria-hidden="true"><Icon name="zoom"/></span>
        </button>
        : <div className="partner-monogram" aria-hidden="true">{partner.partnerName?.trim().charAt(0).toUpperCase() || 'P'}</div>}
      <div className="partner-copy">
        <h3>{partner.partnerName}</h3>
        <p>{partner.description}</p>
        {(websiteUrl || mapsUrl) && <div className="partner-links">
          {mapsUrl && <a href={mapsUrl} target="_blank" rel="noopener noreferrer"><Icon name="pin"/>Ver no mapa</a>}
          {websiteUrl && <a href={websiteUrl} target="_blank" rel="noopener noreferrer"><Icon name="globe"/>Visitar site</a>}
        </div>}
      </div>
      {promotionCount > 0 && <button type="button" className="promotion-toggle" onClick={() => setIsOpen((open) => !open)} aria-expanded={isOpen}>
        <span><Icon name="gift"/><strong>{promotionCount}</strong> {promotionCount === 1 ? 'promoção' : 'promoções'}</span>
        <Icon name="chevron" className="chevron"/>
      </button>}
    </div>
    <PromotionList partnershipId={partner.id} isOpen={isOpen}/>
    {logoOpen && <PartnerLogoPreview logoUrl={logoUrl} partnerName={partner.partnerName} onClose={() => setLogoOpen(false)}/>}
  </article>
}

function DriverPage({ publicSlug }) {
  const [state, setState] = useState({ status: 'loading', data: null })
  const [requestAttempt, setRequestAttempt] = useState(0)

  useEffect(() => {
    if (!publicSlug) {
      setState({ status: 'not-found', data: null })
      return undefined
    }

    let isActive = true
    setState({ status: 'loading', data: null })
    getPublicDriver(publicSlug)
      .then((data) => {
        if (isActive) setState(data ? { status: 'success', data } : { status: 'not-found', data: null })
      })
      .catch(() => {
        if (isActive) setState({ status: 'error', data: null })
      })

    return () => { isActive = false }
  }, [publicSlug, requestAttempt])

  useEffect(() => {
    const originalTitle = document.title
    if (state.status === 'success') document.title = `${state.data.profile.driverName} — Puzzli`
    else if (state.status === 'not-found') document.title = 'Motorista não encontrado — Puzzli'
    return () => { document.title = originalTitle }
  }, [state])

  const initials = useMemo(() => state.data?.profile.driverName?.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase(), [state.data])

  return <div className="driver-page">
    <header className="driver-nav"><div className="driver-shell driver-nav-content">
      <a className="driver-logo" href="/" aria-label="Puzzli — página inicial">Puzzli<span>.</span></a>
      <a className="back-home" href="/"><Icon name="arrow"/>Voltar ao início</a>
    </div></header>

    {state.status === 'loading' && <main className="driver-state" aria-live="polite"><span className="driver-spinner"/><h1>A preparar a página do motorista</h1><p>A carregar perfil, parceiros e benefícios.</p></main>}

    {state.status === 'error' && <main className="driver-state"><div className="state-mark">!</div><h1>Não foi possível abrir esta página</h1><p>Houve um problema ao obter a informação. Tente novamente dentro de instantes.</p><button type="button" className="driver-primary-button" onClick={() => setRequestAttempt((value) => value + 1)}><Icon name="retry"/>Tentar novamente</button></main>}

    {state.status === 'not-found' && <main className="driver-state"><div className="state-mark">?</div><h1>Motorista não encontrado</h1><p>Esta página não existe ou já não está disponível publicamente.</p><a className="driver-primary-button" href="/"><Icon name="arrow"/>Voltar à Puzzli</a></main>}

    {state.status === 'success' && (() => {
      const { profile, partnershipCategories = [] } = state.data
      const websiteUrl = safeHttpUrl(profile.websiteUrl)
      const instagramUrl = safeHttpUrl(profile.instagramUrl)
      const partnerTotal = partnershipCategories.reduce((total, group) => total + (group.partnerships?.length || 0), 0)
      return <>
        <main>
          <section className="driver-hero"><div className="driver-shell driver-hero-grid">
            <div className="driver-identity">
              <div className="driver-photo-wrap">
                <DriverPhoto key={profile.publicSlug} publicSlug={profile.publicSlug} driverName={profile.driverName} initials={initials}/>
                <span className="verified-badge" title="Perfil Puzzli">P</span>
              </div>
              <div className="driver-intro"><span className="eyebrow">Motorista Puzzli</span><h1>{profile.driverName}</h1>{profile.headline && <p className="driver-headline">{profile.headline}</p>}</div>
            </div>
            <aside className="driver-contact-card" aria-label="Contactos do motorista">
              <span className="contact-label">Fale diretamente comigo</span>
              {profile.phoneNumber && <ContactLink href={`tel:${profile.phoneNumber.replace(/[^+\d]/g, '')}`} icon="phone">{profile.phoneNumber}</ContactLink>}
              {profile.email && <ContactLink href={`mailto:${profile.email}`} icon="mail">{profile.email}</ContactLink>}
              {instagramUrl && <ContactLink href={instagramUrl} icon="instagram" external>Instagram</ContactLink>}
              {websiteUrl && <ContactLink href={websiteUrl} icon="globe" external>Website</ContactLink>}
              {!profile.phoneNumber && !profile.email && !instagramUrl && !websiteUrl && <p className="no-contact">Contactos não disponíveis.</p>}
            </aside>
          </div></section>

          {profile.biography && <section className="driver-about"><div className="driver-shell"><span className="section-kicker">Sobre mim</span><p>{profile.biography}</p></div></section>}

          <section className="partnerships-section"><div className="driver-shell">
            <div className="partnerships-heading"><div><span className="section-kicker">Recomendações locais</span><h2>Parceiros e benefícios</h2></div>{partnerTotal > 0 && <p>{partnerTotal} {partnerTotal === 1 ? 'parceiro selecionado' : 'parceiros selecionados'}</p>}</div>
            {partnershipCategories.length === 0 ? <div className="partners-empty"><Icon name="gift"/><h3>Novidades em breve</h3><p>Este motorista ainda não tem parceiros públicos.</p></div> : partnershipCategories.map((group) => <section className="partner-category" key={group.category}>
              <div className="category-title"><h2>{group.category}</h2><span>{group.partnerships?.length || 0}</span></div>
              <div className="partners-list">{(group.partnerships || []).map((partner) => <PartnerCard partner={partner} key={partner.id}/>)}</div>
            </section>)}
          </div></section>
        </main>
        <footer className="driver-footer"><div className="driver-shell"><a className="driver-logo" href="/">Puzzli<span>.</span></a><p>Viagens próximas. Experiências locais.</p><span>© {new Date().getFullYear()} Puzzli.</span></div></footer>
      </>
    })()}
  </div>
}

export default DriverPage
