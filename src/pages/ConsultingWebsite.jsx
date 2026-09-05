import { useEffect, useMemo, useRef, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getCountries, getCountryCallingCode } from 'libphonenumber-js/min'
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Briefcase,
  ChevronDown,
  ClipboardList,
  Database,
  ExternalLink,
  FlaskConical,
  Linkedin,
  Mail,
  Menu,
  Phone,
  TrendingUp,
  X,
} from 'lucide-react'
import {
  blogPosts,
  bluetickNewsItems,
  globalHealthNewsItems,
  faqs,
  getPageMeta,
  getPostPath,
  navigationLinks,
  pageContent,
  productsContent,
  vacanciesContent,
  resources,
  siteName,
  siteUrl,
} from '@/content/siteContent'

const services = [
  {
    icon: BarChart3,
    title: 'Statistical Analysis',
    body: 'Advanced modelling, survival analysis, forecasting, and publication-ready outputs for clinical research, surveys, and routine health data.',
  },
  {
    icon: Database,
    title: 'Data Management',
    body: 'Secure database design, REDCap implementation, validation workflows, and analysis-ready datasets for research and programme teams.',
  },
  {
    icon: ClipboardList,
    title: 'Research Support',
    body: 'Study design, sample size planning, literature reviews, technical writing, and evidence packages for rigorous health research delivery.',
  },
  {
    icon: Briefcase,
    title: 'Project Management',
    body: 'Operational planning, SOPs, stakeholder coordination, and delivery oversight for complex public health and research programmes.',
  },
  {
    icon: TrendingUp,
    title: 'Monitoring & Evaluation',
    body: 'Results frameworks, indicator systems, data quality reviews, and programme evaluations that support donor reporting and decision-making.',
  },
  {
    icon: FlaskConical,
    title: 'Clinical Trials Support',
    body: 'Trial design, SAP development, interim analysis, and protocol-linked statistical support for sponsors and investigators.',
  },
  {
    icon: TrendingUp,
    title: 'Health Economics & Economic Evaluation',
    body: 'Cost-effectiveness analysis, budget impact modelling, and decision-focused evaluation support for policy and investment planning.',
  },
]

const countryNameFormatter = new Intl.DisplayNames(['en'], { type: 'region' })
const contentCardPaletteClasses = [
  'bg-[#f2f8ff] border-blue-100',
  'bg-[#edf7ff] border-sky-100',
  'bg-[#f4f1ff] border-violet-100',
  'bg-[#eefbf7] border-emerald-100',
  'bg-[#fff5ec] border-amber-100',
  'bg-[#f3f7fa] border-slate-200',
]

function getContentCardPaletteClass(index) {
  return contentCardPaletteClasses[index % contentCardPaletteClasses.length]
}

const phoneCountryOptions = getCountries()
  .map((countryCode) => {
    const dialCode = `+${getCountryCallingCode(countryCode)}`
    return {
      value: countryCode,
      countryCode,
      countryName: countryNameFormatter.of(countryCode) || countryCode,
      dialCode,
      flagUrl: `https://flagcdn.com/w40/${countryCode.toLowerCase()}.png`,
    }
  })
  .sort((a, b) => a.countryName.localeCompare(b.countryName))

function normalizePath(pathname) {
  if (!pathname || pathname === '/') {
    return '/'
  }

  let normalized = pathname.replace(/index\.html$/, '')
  if (!normalized.endsWith('/')) {
    normalized = `${normalized}/`
  }

  return normalized
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('en-ZA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function setMetaTag(selector, attributes) {
  let tag = document.head.querySelector(selector)
  if (!tag) {
    tag = document.createElement('meta')
    document.head.appendChild(tag)
  }

  Object.entries(attributes).forEach(([key, value]) => {
    tag.setAttribute(key, value)
  })
}

function PageContainer({ children }) {
  return <div className="premium-page min-h-screen text-slate-900">{children}</div>
}

function SiteHeader({ pathname }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [openDropdownLabel, setOpenDropdownLabel] = useState(null)
  const closeDropdownTimeoutRef = useRef(null)
  const navDropdownItems = {
    Services: [
      { label: 'All Services', href: '/#services' },
      { label: 'Statistical Analysis', href: '/#services' },
      { label: 'Data Management', href: '/#services' },
      { label: 'Research Support', href: '/#services' },
      { label: 'Project Management', href: '/#services' },
      { label: 'Monitoring & Evaluation', href: '/#services' },
      { label: 'Clinical Trials Support', href: '/#services' },
      { label: 'Health Economics & Economic Evaluation', href: '/#services' },
    ],
    Blogs: [{ label: 'All Blog Posts', href: '/blog/' }],
    News: [
      { label: 'All News', href: '/news/' },
      { label: 'Bluetick Updates', href: '/news/#bluetick-updates' },
      { label: 'African Health News', href: '/news/#african-health-news' },
      { label: 'Global Public Health News', href: '/news/#global-public-health-news' },
    ],
    Products: [
      { label: 'All Products', href: '/products/' },
      { label: 'Bluetick Health EMR', href: '/products/#bluetick-health-emr' },
      { label: 'Upcoming Digital Solutions', href: '/products/#upcoming-digital-solutions' },
    ],
  }

  useEffect(() => {
    setIsMobileMenuOpen(false)
    setOpenDropdownLabel(null)
  }, [pathname])

  useEffect(() => () => {
    if (closeDropdownTimeoutRef.current) {
      window.clearTimeout(closeDropdownTimeoutRef.current)
      closeDropdownTimeoutRef.current = null
    }
  }, [])

  const toggleDropdown = (label) => {
    setOpenDropdownLabel((currentLabel) => (currentLabel === label ? null : label))
  }

  const closeMenus = () => {
    setIsMobileMenuOpen(false)
    setOpenDropdownLabel(null)
  }

  const handleDesktopDropdownBlur = (event, label) => {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setOpenDropdownLabel((currentLabel) => (currentLabel === label ? null : currentLabel))
    }
  }

  const handleDesktopDropdownEnter = (label, hasDropdown) => {
    if (closeDropdownTimeoutRef.current) {
      window.clearTimeout(closeDropdownTimeoutRef.current)
      closeDropdownTimeoutRef.current = null
    }

    if (hasDropdown) {
      setOpenDropdownLabel(label)
    }
  }

  const handleDesktopDropdownLeave = () => {
    if (closeDropdownTimeoutRef.current) {
      window.clearTimeout(closeDropdownTimeoutRef.current)
    }

    closeDropdownTimeoutRef.current = window.setTimeout(() => {
      setOpenDropdownLabel(null)
      closeDropdownTimeoutRef.current = null
    }, 120)
  }

  return (
    <header
      className="sticky top-0 z-[60] overflow-visible border-b border-cyan-400/15 bg-[#0a3d91]/95 text-blue-50 backdrop-blur"
    >
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 overflow-visible px-6 py-4">
        <a
          href="/"
          className="text-sm font-bold tracking-[0.2em] text-white transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-200"
        >
          BLUETICK HEALTH
        </a>
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-xl p-2 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200 md:hidden"
          onClick={() => setIsMobileMenuOpen((open) => !open)}
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-site-navigation"
          aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
        >
          {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
        <nav className="relative z-[70] hidden flex-wrap items-center justify-end gap-3 overflow-visible text-sm text-blue-50 md:flex">
          {navigationLinks.map(({ label, href }) => {
            const isActive = href === '/'
              ? pathname === '/'
              : href.endsWith('/')
                ? pathname === href
                : false
            const dropdownItems = navDropdownItems[label]
            const isContactUs = label === 'Contact Us'

            return (
              <div
                key={href}
                className="header-nav-item relative"
                onMouseEnter={() => handleDesktopDropdownEnter(label, Boolean(dropdownItems))}
                onMouseLeave={handleDesktopDropdownLeave}
                onFocusCapture={() => dropdownItems && setOpenDropdownLabel(label)}
                onBlurCapture={(event) => dropdownItems && handleDesktopDropdownBlur(event, label)}
              >
                <div className="flex items-center gap-1">
                {dropdownItems ? (
                  <button
                    type="button"
                    aria-expanded={openDropdownLabel === label}
                    aria-haspopup="menu"
                    className={`rounded-full px-3 py-2 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200 ${
                      isActive
                        ? 'bg-white/16 font-semibold text-white'
                        : 'text-blue-50 hover:bg-white/10 hover:text-white'
                    }`}
                    onClick={() => toggleDropdown(label)}
                    onFocus={() => setOpenDropdownLabel(label)}
                  >
                    {label}
                  </button>
                ) : (
                  <a
                    href={href}
                    aria-current={isActive ? 'page' : undefined}
                    onClick={closeMenus}
                    className={`rounded-full px-3 py-2 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200 ${
                      isContactUs
                        ? 'bg-cyan-400 text-slate-950 hover:bg-cyan-300'
                        : isActive
                          ? 'bg-white/16 font-semibold text-white'
                          : 'text-blue-50 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {label}
                  </a>
                )}
                {dropdownItems ? (
                  <button
                    type="button"
                    className="rounded-full p-2 text-blue-50 transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200"
                    onClick={() => toggleDropdown(label)}
                    onFocus={() => setOpenDropdownLabel(label)}
                    aria-haspopup="menu"
                    aria-expanded={openDropdownLabel === label}
                    aria-label={`Toggle ${label} submenu`}
                    >
                      <ChevronDown className={`h-4 w-4 stroke-[2.5] transition-transform ${openDropdownLabel === label ? 'rotate-180' : ''}`} />
                    </button>
                  ) : null}
                </div>
                {dropdownItems && openDropdownLabel === label ? (
                  <div
                    className="header-nav-dropdown absolute left-0 top-full z-[80] mt-1 min-w-52 rounded-2xl border border-cyan-400/20 bg-[#0b2a57] py-2 text-blue-50 shadow-lg shadow-slate-950/25"
                    onMouseEnter={() => handleDesktopDropdownEnter(label, true)}
                    onMouseLeave={handleDesktopDropdownLeave}
                  >
                    {dropdownItems.map((item) => (
                      <a
                        key={item.label}
                        href={item.href}
                        onClick={closeMenus}
                        className="block px-4 py-2 text-sm text-blue-50 transition-colors hover:bg-white/10 hover:text-white"
                      >
                        {item.label}
                      </a>
                    ))}
                  </div>
                ) : null}
              </div>
            )
          })}
        </nav>
      </div>
      <nav
        id="mobile-site-navigation"
        className={`mx-auto max-w-6xl px-6 pb-4 md:hidden ${isMobileMenuOpen ? 'block' : 'hidden'}`}
      >
        <div className="rounded-3xl border border-cyan-400/20 bg-[#0b2a57] p-3 text-blue-50 shadow-lg shadow-slate-950/25">
          {navigationLinks.map(({ label, href }) => {
            const dropdownItems = navDropdownItems[label]
            const isContactUs = label === 'Contact Us'

            return (
              <div
                key={`mobile-${href}`}
                className="border-b border-white/10 last:mb-0 last:border-b-0 last:pb-0"
              >
                <div className="flex items-center gap-2 py-1">
                  {dropdownItems ? (
                    <button
                      type="button"
                      className="flex-1 rounded-2xl px-3 py-3 text-left text-sm font-medium text-blue-50 transition-colors hover:bg-white/10"
                      onClick={() => toggleDropdown(label)}
                      aria-haspopup="menu"
                      aria-expanded={openDropdownLabel === label}
                    >
                      {label}
                    </button>
                  ) : (
                    <a
                      href={href}
                      onClick={closeMenus}
                      className={`flex-1 rounded-2xl px-3 py-3 text-sm font-medium transition-colors ${
                        isContactUs
                          ? 'bg-cyan-400 text-slate-950'
                          : 'text-blue-50 hover:bg-white/10'
                      }`}
                    >
                      {label}
                    </a>
                  )}
                  {dropdownItems ? (
                    <button
                      type="button"
                      className="rounded-2xl p-3 text-blue-50 transition-colors hover:bg-white/10"
                      onClick={() => toggleDropdown(label)}
                      aria-haspopup="menu"
                      aria-expanded={openDropdownLabel === label}
                      aria-label={`Toggle ${label} submenu`}
                    >
                      <ChevronDown className={`h-4 w-4 stroke-[2.5] transition-transform ${openDropdownLabel === label ? 'rotate-180' : ''}`} />
                    </button>
                  ) : null}
                </div>
                {dropdownItems && openDropdownLabel === label ? (
                  <div className="pb-3 pl-3">
                    {dropdownItems.map((item) => (
                      <a
                        key={`mobile-${item.label}`}
                        href={item.href}
                        onClick={closeMenus}
                        className="block rounded-2xl px-3 py-2 text-sm text-blue-100 hover:bg-white/10 hover:text-white"
                      >
                        {item.label}
                      </a>
                    ))}
                  </div>
                ) : null}
              </div>
            )
          })}
        </div>
      </nav>
    </header>
  )
}

function KeywordList({ items }) {
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {items.map((item) => (
        <span key={item} className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-900">
          {item}
        </span>
      ))}
    </div>
  )
}

function PageIntro({ title, intro, eyebrow = 'Bluetick Health' }) {
  return (
    <section className="bg-gradient-to-b from-blue-900 to-blue-800 px-6 py-16 text-center text-white">
      <div className="mx-auto max-w-4xl">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-200">{eyebrow}</p>
        <h1 className="mt-4 text-3xl font-bold md:text-4xl">{title}</h1>
        <p className="mx-auto mt-4 max-w-3xl text-lg text-blue-100">{intro}</p>
      </div>
    </section>
  )
}

function HomePage({
  form,
  handleChange,
  handleSubmit,
  globeLogoSrc,
  linkedinLink,
  hasPreparedInquiry,
  selectedPhoneCountry,
  isPhoneCountryOpen,
  setIsPhoneCountryOpen,
  phoneCountryMenuRef,
  handlePhoneCountrySelect,
}) {
  return (
    <>
      <section className="hero-surface relative overflow-hidden px-6 text-white">
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-blue-400/60 to-transparent" />
        <div className="relative mx-auto grid min-h-[86vh] max-w-6xl items-center gap-16 py-20 sm:py-24 lg:min-h-[92vh] lg:grid-cols-[minmax(0,1fr)_minmax(340px,0.9fr)] lg:py-28">
          <div className="max-w-xl">
            <p className="reveal-on-scroll is-visible inline-flex rounded-full border border-blue-400/30 bg-white/5 px-4 py-2 text-sm font-semibold uppercase tracking-[0.22em] text-blue-100">
              Global Evidence. Local Impact.
            </p>
            <h1 className="reveal-on-scroll is-visible mt-8 max-w-[14ch] text-[clamp(3.7rem,6.4vw,5rem)] font-semibold leading-[0.95] tracking-[-0.045em] text-white">
              Independent public health analytics for stronger research decisions
            </h1>
            <p className="reveal-on-scroll is-visible mt-7 max-w-lg text-lg leading-8 text-slate-200 md:text-xl" style={{ '--reveal-delay': '80ms' }}>
              Bluetick Health partners with healthcare systems, researchers, NGOs, and academic teams on rigorous
              statistical analysis, epidemiology, and programme evidence.
            </p>
            <div className="reveal-on-scroll is-visible mt-12 flex flex-wrap items-center gap-4" style={{ '--reveal-delay': '140ms' }}>
              <Button asChild>
                <a href="/#contact">Request a consultation</a>
              </Button>
              <a
                href="/#services"
                className="button-shift inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-3 font-medium text-white transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-300"
              >
                Explore services <ArrowRight className="h-4 w-4" />
              </a>
            </div>
            <a
              href={linkedinLink}
              target="_blank"
              rel="noreferrer"
              className="reveal-on-scroll is-visible mt-8 inline-flex items-center gap-2 text-sm font-medium text-blue-100 transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-300"
              style={{ '--reveal-delay': '210ms' }}
            >
              <Linkedin className="h-4 w-4" /> LinkedIn
            </a>
          </div>

          <div aria-hidden="true" className="relative mx-auto w-full max-w-[31rem]">
            <div className="absolute -left-10 top-8 h-28 w-28 rounded-full bg-cyan-400/15 blur-3xl" />
            <div className="absolute -right-4 bottom-10 h-40 w-40 rounded-full bg-blue-500/20 blur-3xl" />
            <div className="reveal-on-scroll reveal-slide is-visible relative overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(10,29,55,0.96),rgba(6,18,35,0.96))] p-7 shadow-[0_28px_70px_rgba(2,12,27,0.45)]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-200">Analytics snapshot</p>
                  <p className="mt-2 text-2xl font-semibold text-white">Regional health insight</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-2">
                  <img src={globeLogoSrc} alt="" className="h-12 w-12 object-contain opacity-80" />
                </div>
              </div>
              <div className="mt-8 rounded-[24px] border border-white/10 bg-[#0b1f3d] p-5">
                <div className="flex items-end gap-3">
                  {[42, 58, 74, 64, 92, 118].map((height, index) => (
                    <div key={height} className="flex flex-1 flex-col items-center gap-3">
                      <span className={`h-2 w-2 rounded-full ${index === 4 ? 'bg-cyan-300' : 'bg-blue-200/70'}`} />
                      <div
                        className={`w-full rounded-full ${index === 4 ? 'bg-gradient-to-t from-cyan-400 to-blue-500' : 'bg-white/12'}`}
                        style={{ height }}
                      />
                    </div>
                  ))}
                </div>
                <div className="mt-5 flex items-center justify-between text-xs uppercase tracking-[0.2em] text-slate-400">
                  <span>Trend</span>
                  <span>Year-over-year</span>
                </div>
              </div>
              <div className="mt-7 rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Reporting cadence</p>
                <p className="mt-2 text-2xl font-semibold text-white">Decision-ready insights</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-code-bg section-bg-about px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-4xl rounded-[28px] border border-blue-200 bg-[#e7f0ff] p-8 shadow-[0_18px_40px_rgba(15,23,42,0.08)] md:p-12">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-700">About</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-slate-950 md:text-4xl">
              Independent consultancy for complex health data and research delivery
            </h2>
            <p className="mt-6 text-lg leading-8 text-slate-600">
              Independent Consultancy specializing in public health research, healthcare analytics, and statistical
              modelling. We support evidence-based decision-making through analysis of large-scale health datasets,
              epidemiological studies, and advanced statistical methods. Our multidisciplinary team brings together
              clinicians, epidemiologists, biostatisticians, health economists, and programme specialists to deliver
              solutions that are both scientifically sound and practically relevant, combining global best practice with
              deep local knowledge.
            </p>
          </div>
        </div>
      </section>

      <section id="services" className="section-code-bg section-bg-services section-code-bg--shine bg-[#f4f7fb] px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl reveal-on-scroll">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-700">Services</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-slate-950 md:text-4xl">
              Specialized consulting services for evidence-driven health decisions
            </h2>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {services.map(({ icon: Icon, title, body }, index) => (
              <Card
                key={title}
                className="service-card reveal-on-scroll h-full"
                style={{ '--reveal-delay': `${index * 70}ms` }}
              >
                <CardContent className="flex h-full flex-col p-8 md:p-9">
                  <div className="mb-7 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.14)]">
                    <Icon className="h-6 w-6 text-cyan-200" />
                  </div>
                  <h3 className="min-h-[3.5rem] text-xl font-semibold tracking-[-0.02em] text-white">{title}</h3>
                  <p className="mt-5 text-base leading-7 text-blue-100/85">{body}</p>
                  <a
                    href="/#contact"
                    className="mt-auto inline-flex items-center gap-2 pt-8 text-sm font-medium text-cyan-200 transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-300"
                  >
                    Discuss service <ArrowRight className="h-4 w-4" />
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="projects" className="section-code-bg section-bg-projects section-code-bg--shine bg-white px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-700">Projects & Publications</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-slate-950 md:text-4xl">
              Current platform work grounded in practical health system use
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="project-card reveal-on-scroll rounded-[24px]" style={{ '--reveal-delay': '90ms' }}>
              <CardContent className="p-8 md:p-9">
                <p className="inline-flex rounded-full border border-cyan-300/20 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100">
                  Featured platform
                </p>
                <h3 className="mt-5 text-xl font-semibold tracking-[-0.02em] text-white">Bluetick Health EMR Platform</h3>
                <p className="mt-4 text-base leading-7 text-blue-100/85">
                  Bluetick Health Electronic Medical Record (EMR) in Development stage.
                </p>
                <p className="mt-4 text-base leading-7 text-blue-100/85">
                  Bluetick Health is an EMR platform designed for routine clinical data collection, real-time analytics,
                  dashboards, and automated reporting. We welcome funding, technical partnerships, healthcare
                  institutions, and research collaborations to accelerate platform development, testing, implementation,
                  and launch.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section id="contact" className="section-code-bg section-bg-contact scroll-mt-24 bg-[#041325] px-6 py-24 text-white">
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-8 rounded-[30px] border border-white/10 bg-[#051a33] p-6 shadow-[0_24px_60px_rgba(2,8,23,0.45)] md:grid-cols-[minmax(0,0.4fr)_minmax(0,0.6fr)] md:p-10">
              <div className="reveal-on-scroll rounded-[24px] border border-white/10 bg-white/5 p-7 md:p-8">
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-200">Contact Us</p>
                <h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-white">Request your free consultation</h2>
                <p className="mt-5 text-base leading-7 text-blue-100">
                  Reach out to discuss your project scope, timelines, and data needs.
                </p>
                <div className="mt-8 flex flex-col gap-4 text-blue-100">
                  <a
                    href="mailto:mitikuhermanng@gmail.com"
                    className="inline-flex items-center gap-2 rounded-full py-1 text-blue-100 transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-300"
                  >
                    <Mail className="h-5 w-5 text-cyan-200" /> mitikuhermanng@gmail.com
                  </a>
                  <a
                    href="tel:+27611170478"
                    className="inline-flex items-center gap-2 rounded-full py-1 text-blue-100 transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-300"
                  >
                    <Phone className="h-5 w-5 text-cyan-200" /> +27 611170478
                  </a>
                </div>
              </div>

              <div className="reveal-on-scroll rounded-[24px] border border-slate-200 bg-[#f8fafc] p-8 text-slate-900 shadow-[0_18px_40px_rgba(15,23,42,0.12)] md:p-10" style={{ '--reveal-delay': '90ms' }}>
                <p className="text-center text-sm font-semibold uppercase tracking-[0.22em] text-blue-700">Start your project discussion</p>
                <div className="mb-8 mt-6 flex flex-col items-center justify-center gap-4 text-slate-700 sm:flex-row sm:gap-8">
                <a
                  href="mailto:mitikuhermanng@gmail.com"
                  className="inline-flex items-center gap-2 rounded-full px-3 py-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
                >
                  <Mail className="h-5 w-5 text-blue-600" /> mitikuhermanng@gmail.com
                </a>
                <a
                  href="tel:+27611170478"
                  className="inline-flex items-center gap-2 rounded-full px-3 py-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
                >
                  <Phone className="h-5 w-5 text-blue-600" /> +27 611170478
                </a>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <input
                  name="name"
                  type="text"
                  autoComplete="name"
                  placeholder="Name"
                  value={form.name}
                  required
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-slate-900 placeholder:text-slate-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
                  onChange={handleChange}
                />
                <input
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="Email"
                  value={form.email}
                  required
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-slate-900 placeholder:text-slate-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
                  onChange={handleChange}
                />
                <div className="grid gap-3 sm:grid-cols-[minmax(0,220px)_minmax(0,1fr)]">
                  <div className="relative" ref={phoneCountryMenuRef}>
                    <button
                      type="button"
                      className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
                      onClick={() => setIsPhoneCountryOpen((open) => !open)}
                      aria-haspopup="listbox"
                      aria-expanded={isPhoneCountryOpen}
                      aria-label="Phone country"
                    >
                      <span className="inline-flex items-center gap-2 truncate">
                        <img
                          src={selectedPhoneCountry.flagUrl}
                          alt=""
                          className="h-4 w-6 shrink-0 rounded-sm border border-gray-200 object-cover"
                          loading="lazy"
                        />
                        <span className="truncate">
                          {selectedPhoneCountry.countryName} {selectedPhoneCountry.dialCode}
                        </span>
                      </span>
                      <span aria-hidden="true" className="text-gray-500">
                        ▾
                      </span>
                    </button>
                    {isPhoneCountryOpen ? (
                      <ul
                        role="listbox"
                        className="absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-2xl border border-gray-200 bg-white py-1 shadow-lg"
                      >
                        {phoneCountryOptions.map((option) => (
                          <li key={option.value}>
                            <button
                              type="button"
                              className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-blue-50 ${
                                option.value === form.phoneCountry ? 'bg-blue-50' : ''
                              }`}
                              onClick={() => handlePhoneCountrySelect(option.value)}
                            >
                              <img
                                src={option.flagUrl}
                                alt=""
                                className="h-4 w-6 shrink-0 rounded-sm border border-gray-200 object-cover"
                                loading="lazy"
                              />
                              <span>
                                {option.countryName} {option.dialCode}
                              </span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                  <input
                    name="phoneNumber"
                    type="tel"
                    autoComplete="tel-national"
                    placeholder="Phone number"
                    value={form.phoneNumber}
                    required
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-slate-900 placeholder:text-slate-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
                    onChange={handleChange}
                  />
                </div>
                <textarea
                  name="message"
                  rows={5}
                  placeholder="Tell us about your project"
                  value={form.message}
                  required
                  className="resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-slate-900 placeholder:text-slate-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
                  onChange={handleChange}
                />
                <button
                  type="submit"
                  className="button-shift rounded-2xl bg-blue-600 px-5 py-3.5 font-semibold text-white transition-colors hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
                >
                  Prepare your inquiry email
                </button>
                <p className="text-sm leading-6 text-slate-600">
                  Submitting opens your email app with your message prefilled for faster follow-up.
                </p>
                {hasPreparedInquiry ? (
                  <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm leading-6 text-blue-900">
                    If your email app did not open, send your message directly to{' '}
                    <a href="mailto:mitikuhermanng@gmail.com" className="font-semibold underline underline-offset-2">
                      mitikuhermanng@gmail.com
                    </a>{' '}
                    or call{' '}
                    <a href="tel:+27611170478" className="font-semibold underline underline-offset-2">
                      +27 611170478
                    </a>
                    .
                  </div>
                ) : null}
              </form>
            </div>
          </div>
          </div>
        </section>
    </>
  )
}

function BlogPage() {
  const blogInfo = pageContent['/blog/']

  return (
    <>
      <PageIntro title={blogInfo.heading} intro={blogInfo.intro} eyebrow="Research insights" />
      <section className="section-code-bg section-bg-services section-code-bg--shine bg-[#f3f9ff] px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-6 md:grid-cols-2">
            {blogPosts.map((post, index) => (
              <Card key={post.slug} className={getContentCardPaletteClass(index)}>
                <CardContent className="p-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">{formatDate(post.datePublished)}</p>
                  <h2 className="mt-3 text-xl font-semibold text-blue-900">{post.title}</h2>
                  <p className="mt-2 text-sm text-gray-500">By {post.author}</p>
                  <p className="mt-4 text-sm leading-relaxed text-gray-600">{post.excerpt}</p>
                  <KeywordList items={post.keywords} />
                  <div className="mt-6 flex flex-wrap gap-3">
                    <Button asChild>
                      <a href={getPostPath(post.slug)}>Read article</a>
                    </Button>
                    <a
                      href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`${siteUrl}${getPostPath(post.slug)}`)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded border border-blue-200 px-4 py-2 text-sm font-medium text-blue-900 transition-colors hover:bg-blue-50"
                    >
                      <Linkedin className="h-4 w-4" /> Share
                    </a>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

function BlogPostPage({ post }) {
  return (
    <>
      <PageIntro title={post.title} intro={post.summary} eyebrow="Bluetick Health Blog" />
      <section className="section-code-bg section-bg-projects section-code-bg--shine px-6 py-16">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <a href="/blog/" className="inline-flex items-center gap-2 text-sm font-medium text-blue-900 hover:text-blue-700">
              <ArrowLeft className="h-4 w-4" /> Back to Blog
            </a>
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`${siteUrl}${getPostPath(post.slug)}`)}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded border border-blue-200 px-4 py-2 text-sm font-medium text-blue-900 transition-colors hover:bg-blue-50"
            >
              <Linkedin className="h-4 w-4" /> Share article
            </a>
          </div>

          <Card>
            <CardContent className="p-8">
              <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                <span>{formatDate(post.datePublished)}</span>
                <span>•</span>
                <span>{post.author}</span>
              </div>
              <KeywordList items={post.keywords} />
              <div className="mt-8 space-y-5 text-base leading-8 text-gray-700">
                {post.paragraphs.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
              <div className="mt-8 grid gap-6 lg:grid-cols-2">
                <div className="rounded-xl bg-blue-950 p-6 text-sm text-blue-100 shadow-inner">
                  <div className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">{post.codeLanguage} example</div>
                  <pre className="overflow-x-auto whitespace-pre-wrap font-mono leading-7 text-blue-50">{post.code}</pre>
                </div>
                {post.codeOutput && (
                  <div className="rounded-xl border border-blue-100 bg-white p-6 text-sm text-gray-700 shadow-inner">
                    <div className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">Output / graph</div>
                    <pre className="overflow-x-auto whitespace-pre-wrap font-mono leading-7 text-gray-700">{post.codeOutput}</pre>
                  </div>
                )}
              </div>
              {post.codeInterpretation && (
                <div className="mt-6 rounded-xl bg-blue-50 p-6 text-sm leading-7 text-gray-700">
                  <div className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">Interpretation</div>
                  <p>{post.codeInterpretation}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </>
  )
}

function ResourcesPage() {
  const resourcesInfo = pageContent['/resources/']
  const resourceGroupOffsets = resources.reduce((offsets, _, index) => {
    if (index === 0) {
      offsets.push(0)
      return offsets
    }

    offsets.push(offsets[index - 1] + resources[index - 1].items.length)
    return offsets
  }, [])

  return (
    <>
      <PageIntro title={resourcesInfo.heading} intro={resourcesInfo.intro} eyebrow="Backlink-ready references" />
      <section className="section-code-bg section-bg-about px-6 py-16">
        <div className="mx-auto max-w-6xl space-y-8">
          {resources.map((resourceGroup, groupIndex) => (
            <div key={resourceGroup.category}>
              <h2 className="mb-4 text-2xl font-semibold text-blue-900">{resourceGroup.category}</h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {resourceGroup.items.map((item, index) => (
                  <Card
                    key={item.href}
                    className={getContentCardPaletteClass(resourceGroupOffsets[groupIndex] + index)}
                  >
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold text-blue-900">{item.title}</h3>
                      <p className="mt-3 text-sm leading-relaxed text-gray-600">{item.description}</p>
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-blue-700 hover:text-blue-900"
                      >
                        Visit resource <ExternalLink className="h-4 w-4" />
                      </a>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}

function FAQPage() {
  const faqInfo = pageContent['/faq/']

  return (
    <>
      <PageIntro title={faqInfo.heading} intro={faqInfo.intro} eyebrow="Client questions" />
      <section className="section-code-bg section-bg-contact bg-[#f3f9ff] px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-6 md:grid-cols-2">
            {faqs.map((faq) => (
              <Card key={faq.question}>
                <CardContent className="p-6">
                  <h2 className="text-lg font-semibold text-blue-900">{faq.question}</h2>
                  <p className="mt-4 text-sm leading-relaxed text-gray-600">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

function VacanciesPage() {
  const vacanciesInfo = pageContent['/vacancies/']
  const contactPhoneHref = `tel:${vacanciesContent.contactPhone.replace(/\s+/g, '')}`

  return (
    <>
      <PageIntro title={vacanciesInfo.heading} intro={vacanciesInfo.intro} eyebrow="Careers" />
      <section className="section-code-bg section-bg-services section-code-bg--shine bg-[#f3f9ff] px-6 py-16">
        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold text-blue-900">Current openings</h2>
              <p className="mt-4 text-sm leading-relaxed text-gray-600">{vacanciesContent.placeholder}</p>
              {vacanciesContent.jobs.length > 0 && (
                <div className="mt-5 space-y-3">
                  {vacanciesContent.jobs.map((job) => (
                    <div key={job.title} className="rounded-lg border border-blue-100 bg-white p-4">
                      <h3 className="font-semibold text-blue-900">{job.title}</h3>
                      <p className="mt-1 text-sm text-gray-600">{job.summary}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold text-blue-900">Express interest</h2>
              <p className="mt-4 text-sm leading-relaxed text-gray-600">
                Interested in future public health jobs, biostatistician positions, or research careers? Contact us and
                share your profile so we can reach out when vacancies open.
              </p>
              <div className="mt-5 flex flex-col gap-3 text-sm">
                <a href={`mailto:${vacanciesContent.contactEmail}`} className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900">
                  <Mail className="h-4 w-4" /> {vacanciesContent.contactEmail}
                </a>
                <a href={contactPhoneHref} className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900">
                  <Phone className="h-4 w-4" /> {vacanciesContent.contactPhone}
                </a>
              </div>
              <div className="mt-6">
                <Button asChild>
                  <a href="/#contact">Contact Bluetick Health</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </>
  )
}

function NewsPage() {
  const newsInfo = pageContent['/news/']

  return (
    <>
      <PageIntro title={newsInfo.heading} intro={newsInfo.intro} eyebrow="Latest updates" />
      <section className="section-code-bg section-bg-about px-6 py-16">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-2">
          <div id="bluetick-updates">
            <h2 className="mb-5 text-2xl font-semibold text-blue-900">Bluetick Health News</h2>
            <div className="space-y-5">
              {bluetickNewsItems.map((item, index) => (
                <Card key={`${item.date}-${item.title}`} className={getContentCardPaletteClass(index)}>
                  <CardContent className="p-6">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">{formatDate(item.date)}</p>
                    <h3 className="mt-3 text-lg font-semibold text-blue-900">{item.title}</h3>
                    <p className="mt-2 text-sm text-gray-500">
                      {item.source} • {item.category}
                    </p>
                    <p className="mt-3 text-sm leading-relaxed text-gray-600">{item.summary}</p>
                    <a href={item.link} className="mt-4 inline-flex items-center text-sm font-medium text-blue-700 hover:text-blue-900">
                      Read update
                    </a>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          <div id="african-health-news">
            <div id="global-public-health-news" />
            <h2 className="mb-5 text-2xl font-semibold text-blue-900">Global &amp; African Health News</h2>
            <div className="space-y-5">
              {globalHealthNewsItems.map((item, index) => (
                <Card key={`${item.date}-${item.title}`} className={getContentCardPaletteClass(index + 1)}>
                  <CardContent className="p-6">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">{formatDate(item.date)}</p>
                    <h3 className="mt-3 text-lg font-semibold text-blue-900">{item.title}</h3>
                    <p className="mt-2 text-sm text-gray-500">
                      {item.source} • {item.category}
                    </p>
                    <p className="mt-3 text-sm leading-relaxed text-gray-600">{item.summary}</p>
                    <p className="mt-3 text-sm text-gray-600">
                      <span className="font-medium text-blue-900">Consulting relevance:</span> {item.relevance}
                    </p>
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-blue-700 hover:text-blue-900"
                    >
                      View source <ExternalLink className="h-4 w-4" />
                    </a>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

function ProductsPage() {
  const productsInfo = pageContent['/products/']
  const featuredProduct = productsContent.products[0]

  return (
    <>
      <PageIntro title={productsInfo.heading} intro={productsInfo.intro} eyebrow="Digital health solutions" />
      <section id="bluetick-health-emr" className="relative overflow-hidden bg-[#051427] px-6 py-20 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.22),_transparent_45%),radial-gradient(circle_at_bottom_right,_rgba(34,211,238,0.14),_transparent_40%)]" />
        <div className="relative mx-auto max-w-4xl">
          <div className="reveal-on-scroll">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-200">{featuredProduct.category}</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-white md:text-4xl">{featuredProduct.name}</h2>
            <p className="mt-5 max-w-2xl text-base leading-7 text-blue-100">{featuredProduct.description}</p>
            <span className="mt-7 inline-flex rounded-full border border-cyan-300/30 bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-100">
              {featuredProduct.status}
            </span>
          </div>
        </div>
      </section>
      <section className="section-code-bg section-bg-services section-code-bg--shine bg-[#f3f9ff] px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 rounded-xl bg-[#eaf4ff] p-6 md:p-8">
            <p className="text-sm leading-relaxed text-gray-700">{productsContent.partnershipMessage}</p>
          </div>
          <div className="max-w-xl">
            <Card id="upcoming-digital-solutions" className="reveal-on-scroll service-card h-full" style={{ '--reveal-delay': '120ms' }}>
              <CardContent className="flex h-full flex-col p-6">
                <h2 className="text-lg font-semibold text-white">Upcoming Digital Solutions</h2>
                <p className="mt-2 text-sm text-cyan-100/75">In planning</p>
                <p className="mt-4 text-sm leading-relaxed text-blue-100/85">
                  Bluetick Health is preparing additional digital solutions to strengthen analytics, interoperability,
                  and decision support for health programmes.
                </p>
                <span className="mt-auto inline-flex self-start rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-medium text-cyan-100">
                  Upcoming
                </span>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </>
  )
}

export default function ConsultingWebsite() {
  const linkedinLink = 'https://www.linkedin.com/company/bluetick-health'
  const globeLogoSrc = `${import.meta.env.BASE_URL}assets/bluetick-globe.png`
  const defaultPhoneCountry = phoneCountryOptions.find((option) => option.countryCode === 'ZA')?.value ?? phoneCountryOptions[0].value
  const [form, setForm] = useState({ name: '', email: '', phoneCountry: defaultPhoneCountry, phoneNumber: '', message: '' })
  const [hasPreparedInquiry, setHasPreparedInquiry] = useState(false)
  const [isPhoneCountryOpen, setIsPhoneCountryOpen] = useState(false)
  const phoneCountryMenuRef = useRef(null)
  const [activeHash, setActiveHash] = useState(window.location.hash)
  const pathname = normalizePath(window.location.pathname)
  const currentPost = useMemo(() => blogPosts.find((post) => getPostPath(post.slug) === pathname), [pathname])
  const selectedPhoneCountry = phoneCountryOptions.find((option) => option.value === form.phoneCountry) ?? phoneCountryOptions[0]

  useEffect(() => {
    const pageMeta = getPageMeta(pathname)

    document.title = pageMeta.title
    setMetaTag("meta[name='description']", { name: 'description', content: pageMeta.description })
    setMetaTag("meta[name='keywords']", { name: 'keywords', content: pageMeta.keywords })
    setMetaTag("meta[name='author']", { name: 'author', content: siteName })
    setMetaTag("meta[property='og:type']", { property: 'og:type', content: pageMeta.type })
    setMetaTag("meta[property='og:url']", { property: 'og:url', content: `${siteUrl}${pathname}` })
    setMetaTag("meta[property='og:title']", { property: 'og:title', content: pageMeta.title })
    setMetaTag("meta[property='og:description']", { property: 'og:description', content: pageMeta.description })
    setMetaTag("meta[property='og:image']", { property: 'og:image', content: `${siteUrl}/assets/bluetick-globe.png` })
    setMetaTag("meta[property='og:site_name']", { property: 'og:site_name', content: siteName })
    setMetaTag("meta[name='twitter:card']", { name: 'twitter:card', content: 'summary_large_image' })
    setMetaTag("meta[name='twitter:url']", { name: 'twitter:url', content: `${siteUrl}${pathname}` })
    setMetaTag("meta[name='twitter:title']", { name: 'twitter:title', content: pageMeta.title })
    setMetaTag("meta[name='twitter:description']", { name: 'twitter:description', content: pageMeta.description })
    setMetaTag("meta[name='twitter:image']", { name: 'twitter:image', content: `${siteUrl}/assets/bluetick-globe.png` })

    let canonical = document.head.querySelector("link[rel='canonical']")
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.rel = 'canonical'
      document.head.appendChild(canonical)
    }
    canonical.href = `${siteUrl}${pathname}`

    let structuredData = document.getElementById('bluetick-structured-data')
    if (!structuredData) {
      structuredData = document.createElement('script')
      structuredData.id = 'bluetick-structured-data'
      structuredData.type = 'application/ld+json'
      document.head.appendChild(structuredData)
    }
    structuredData.textContent = JSON.stringify(pageMeta.structuredData)
  }, [pathname])

  useEffect(() => {
    if (pathname !== '/') {
      return
    }

    if (window.location.hash) {
      const target = document.querySelector(window.location.hash)
      if (target) {
        window.requestAnimationFrame(() => {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' })
        })
      }
    }
  }, [pathname])

  useEffect(() => {
    const syncHash = () => setActiveHash(window.location.hash)
    syncHash()
    window.addEventListener('hashchange', syncHash)
    return () => window.removeEventListener('hashchange', syncHash)
  }, [pathname])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (phoneCountryMenuRef.current && !phoneCountryMenuRef.current.contains(event.target)) {
        setIsPhoneCountryOpen(false)
      }
    }

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsPhoneCountryOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  useEffect(() => {
    const revealNodes = Array.from(document.querySelectorAll('.reveal-on-scroll'))
    if (!revealNodes.length) {
      return
    }

    const reduceMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (reduceMotionQuery.matches) {
      revealNodes.forEach((node) => node.classList.add('is-visible'))
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.14, rootMargin: '0px 0px -8% 0px' }
    )

    revealNodes.forEach((node) => observer.observe(node))

    return () => observer.disconnect()
  }, [pathname, activeHash])

  const handleChange = (e) => {
    setHasPreparedInquiry(false)
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handlePhoneCountrySelect = (phoneCountry) => {
    setForm((prev) => ({ ...prev, phoneCountry }))
    setIsPhoneCountryOpen(false)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setHasPreparedInquiry(true)
    const subject = encodeURIComponent(`Consulting Inquiry from ${form.name}`)
    const body = encodeURIComponent(
      `Name: ${form.name}\nEmail: ${form.email}\nPhone: ${selectedPhoneCountry.dialCode} ${form.phoneNumber}\n\nProject details:\n${form.message}`
    )
    const mailto = `mailto:mitikuhermanng@gmail.com?subject=${subject}&body=${body}`
    window.location.href = mailto
  }

  let content = (
    <HomePage
      form={form}
      handleChange={handleChange}
      handleSubmit={handleSubmit}
      globeLogoSrc={globeLogoSrc}
      linkedinLink={linkedinLink}
      hasPreparedInquiry={hasPreparedInquiry}
      selectedPhoneCountry={selectedPhoneCountry}
      isPhoneCountryOpen={isPhoneCountryOpen}
      setIsPhoneCountryOpen={setIsPhoneCountryOpen}
      phoneCountryMenuRef={phoneCountryMenuRef}
      handlePhoneCountrySelect={handlePhoneCountrySelect}
    />
  )

  if (pathname === '/blog/') {
    content = <BlogPage />
  } else if (currentPost) {
    content = <BlogPostPage post={currentPost} />
  } else if (pathname === '/news/') {
    content = <NewsPage />
  } else if (pathname === '/products/') {
    content = <ProductsPage />
  } else if (pathname === '/resources/') {
    content = <ResourcesPage />
  } else if (pathname === '/faq/') {
    content = <FAQPage />
  } else if (pathname === '/vacancies/') {
    content = <VacanciesPage />
  }

  return (
    <PageContainer>
      <SiteHeader pathname={pathname} />
      {content}
      <footer className="section-code-bg section-bg-footer bg-blue-900 py-8 text-center text-sm text-blue-200">
        © {new Date().getFullYear()} Bluetick Health Consultancy. All rights reserved.
      </footer>
    </PageContainer>
  )
}
