import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  ArrowLeft,
  BarChart3,
  Briefcase,
  ClipboardList,
  Database,
  ExternalLink,
  FlaskConical,
  Linkedin,
  Mail,
  Phone,
  TrendingUp,
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
    body: 'Our biostatisticians provide expert statistical consulting for health researchers, clinicians, and public health practitioners. We apply advanced methods including linear and logistic regression, Cox proportional hazards models, Kaplan-Meier survival analysis, mixed-effects models, generalised estimating equations (GEE), ARIMA time series forecasting, and multivariate analysis. We work with complex health datasets from clinical trials, cohort studies, cross-sectional surveys, and routine health information systems - delivering clear, publication-ready results using R, Stata, and SAS.',
  },
  {
    icon: Database,
    title: 'Data Management',
    body: 'We provide end-to-end data management solutions for clinical and public health research - from database architecture and electronic data capture (EDC) design to data quality assurance, audit trails, and regulatory-compliant data governance. Our team supports NGOs, academic institutions, and health programmes in building clean, analysis-ready datasets. We specialise in REDCap implementation, including custom instrument design, branching logic, data validation rules, user training, and integration with statistical analysis pipelines.',
  },
  {
    icon: ClipboardList,
    title: 'Research Support',
    body: 'We offer comprehensive research support services for health research teams - from epidemiological study design and sample size calculations to literature reviews, data analysis planning, and scientific writing. Our consultants assist with grant proposal development, ethics applications, interim and final study reports, and peer-reviewed manuscript preparation. We support randomised controlled trials (RCTs), observational studies, systematic reviews, and programme evaluations for academic institutions, NGOs, and government health departments.',
  },
  {
    icon: Briefcase,
    title: 'Project Management',
    body: 'We bring structured project management expertise to public health and research programmes - ensuring timelines, budgets, and quality standards are met. Our services include the development of standard operating procedures (SOPs), study protocols, risk registers, and operational plans. We support Good Clinical Practice (GCP) compliance, stakeholder coordination, and regulatory submissions. Ideal for health programmes, NGOs, and research institutions seeking operational rigour and accountability across complex, multi-site projects.',
  },
  {
    icon: TrendingUp,
    title: 'Monitoring & Evaluating Public Health Programs',
    body: 'Our M&E services include results frameworks, indicator development, data collection tool design, routine data quality assessments (RDQA), mid-term and end-line evaluations, and impact assessments. We support donor reporting, PEPFAR and Global Fund programmes, and government health departments across sub-Saharan Africa.',
  },
  {
    icon: FlaskConical,
    title: 'Clinical Trials Support',
    body: 'We provide expert biostatistical consulting throughout the full clinical trial lifecycle - from Phase I through Phase IV. Our services include sample size and power calculations, randomisation and allocation concealment, statistical analysis plans (SAPs), interim analysis support, and final clinical study reports (CSRs). We work to ICH E9 and CONSORT standards, ensuring regulatory-compliant trial conduct for academic and industry sponsors.',
  },
  {
    icon: TrendingUp,
    title: 'Health Economics & Economic Evaluation',
    body: 'Our health economists apply decision-analytic modelling techniques - including cost-utility analysis (CUA), cost-benefit analysis (CBA), Markov models, and discrete event simulation - to support HTA submissions for SAHPRA, NICE, and other health technology bodies. We serve pharmaceutical companies, medical device manufacturers, and public health programmes seeking evidence-based economic justification.',
  },
]

const phoneCountryOptions = [
  { value: '+27', label: '🇿🇦 South Africa' },
  { value: '+1', label: '🇺🇸 United States' },
  { value: '+44', label: '🇬🇧 United Kingdom' },
  { value: '+251', label: '🇪🇹 Ethiopia' },
]

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
  return <div className="min-h-screen bg-[#eaf4ff] text-gray-800">{children}</div>
}

function SiteHeader({ pathname }) {
  const navDropdownItems = {
    Services: [
      { label: 'Statistical Analysis', href: '/#services' },
      { label: 'Data Management', href: '/#services' },
      { label: 'Research Support', href: '/#services' },
      { label: 'Project Management', href: '/#services' },
      { label: 'Clinical Trials Support', href: '/#services' },
      { label: 'Health Economics & Economic Evaluation', href: '/#services' },
    ],
    Blogs: [{ label: 'All blog post pages', href: '/blog/' }],
    News: [
      { label: 'Bluetick Updates', href: '/news/#bluetick-updates' },
      { label: 'African Health News', href: '/news/#african-health-news' },
      { label: 'Global Public Health News', href: '/news/#global-public-health-news' },
    ],
    Products: [
      { label: 'Bluetick Health EMR', href: '/products/#bluetick-health-emr' },
      { label: 'Upcoming Digital Solutions', href: '/products/#upcoming-digital-solutions' },
    ],
  }

  return (
    <header className="sticky top-0 z-20 border-b border-blue-100 bg-[#eaf4ff]/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-4">
        <a href="/" className="text-sm font-bold tracking-[0.2em] text-blue-900">
          BLUETICK HEALTH
        </a>
        <nav className="flex flex-wrap items-center justify-end gap-3 text-sm text-blue-900">
          {navigationLinks.map(({ label, href }) => {
            const isActive = href === '/'
              ? pathname === '/'
              : href.endsWith('/')
                ? pathname === href
                : false
            const dropdownItems = navDropdownItems[label]
            const isContactUs = label === 'Contact Us'

            return (
              <div key={href} className="header-nav-item relative">
                <a
                  href={href}
                  aria-current={isActive ? 'page' : undefined}
                  className={`rounded px-2 py-1 transition-colors hover:bg-blue-100 ${isActive ? 'bg-blue-100 font-semibold' : ''} ${
                    isContactUs ? 'header-contact-us-nav' : ''
                  }`}
                >
                  {label}
                </a>
                {dropdownItems ? (
                  <div className="header-nav-dropdown absolute left-0 top-full z-30 min-w-44 rounded-md border border-blue-100 bg-white py-1 shadow-lg">
                    {dropdownItems.map((item) => (
                      <a
                        key={item.label}
                        href={item.href}
                        className="block px-3 py-2 text-sm text-blue-900 transition-colors hover:bg-blue-50 hover:text-blue-700"
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

function HomePage({ form, handleChange, handleSubmit, globeLogoSrc, linkedinLink, showConsultationSection }) {
  return (
    <>
      <section className="bg-gradient-to-b from-blue-900 to-blue-800 px-6 py-20 text-center">
        <div className="mb-8 flex justify-center">
          <div className="inline-flex flex-col items-center gap-2 rounded-2xl bg-white px-8 py-5 shadow-lg">
            <div className="flex items-center gap-3">
              <img
                src={globeLogoSrc}
                alt="Bluetick Health globe logo"
                width="72"
                height="72"
                className="h-[72px] w-[72px] shrink-0 object-contain"
              />
              <div className="flex flex-col leading-none">
                <span className="text-3xl font-black tracking-widest text-blue-900">BLUETICK</span>
                <span className="text-3xl font-black tracking-widest text-cyan-500">HEALTH</span>
              </div>
            </div>
            <p className="mt-1 text-xs font-semibold tracking-[0.2em] text-blue-800">GLOBAL EVIDENCE. LOCAL IMPACT.</p>
          </div>
        </div>

        <h1 className="mx-auto max-w-4xl text-3xl font-bold text-white md:text-4xl">
          Independent Statistical & Public Health Research Consultancy
        </h1>
        <p className="mx-auto mt-4 max-w-3xl text-lg text-blue-100">
          Supporting healthcare systems, clinical research, NGOs, and academic institutions with advanced statistical analysis and epidemiological insights.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Button asChild>
            <a href="/#contact">Get in Touch</a>
          </Button>
          <a
            href={linkedinLink}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded border border-white px-4 py-2 font-medium text-white transition-colors hover:bg-white hover:text-blue-900"
          >
            <Linkedin className="h-4 w-4" /> LinkedIn
          </a>
        </div>
      </section>

      <section className="section-code-bg section-bg-about px-6 py-16">
        <div className="mx-auto max-w-5xl rounded-xl bg-[#dff0ff] p-8 md:p-10">
          <h2 className="mb-4 text-2xl font-semibold text-blue-900">About</h2>
          <p className="leading-relaxed text-gray-700">
            Independent Consultancy specializing in public health research, healthcare analytics, and statistical modelling.
            We support evidence-based decision-making through analysis of large-scale health datasets, epidemiological
            studies, and advanced statistical methods. Our multidisciplinary team brings together clinicians,
            epidemiologists, biostatisticians, health economists, and programme specialists to deliver solutions that
            are both scientifically sound and practically relevant, combining global best practice with deep local
            knowledge.
          </p>
        </div>
      </section>

      <section id="services" className="section-code-bg section-bg-services section-code-bg--shine bg-[#f3f9ff] px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-8 text-2xl font-semibold text-blue-900">Services</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {services.map(({ icon: Icon, title, body }) => (
              <Card key={title}>
                <CardContent className="p-6">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                    <Icon className="h-5 w-5 text-blue-700" />
                  </div>
                  <h3 className="mb-2 font-semibold text-blue-900">{title}</h3>
                  <p className="text-sm leading-relaxed text-gray-600">{body}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="projects" className="section-code-bg section-bg-projects section-code-bg--shine px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-6 text-2xl font-semibold text-blue-900">Projects & Publications</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardContent className="p-6">
                <h3 className="mb-2 text-lg font-semibold text-blue-900">Bluetick Health EMR Platform</h3>
                <p className="text-sm leading-relaxed text-gray-600">
                  Bluetick Health Electronic Medical Record (EMR) in Development stage.
                </p>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">
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

      <div id="contact" />
      {showConsultationSection ? (
        <section className="section-code-bg section-bg-contact bg-[#f3f9ff] px-6 py-16">
          <div className="mx-auto max-w-2xl">
            <p className="text-center text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">Contact Us</p>
            <h2 className="mb-8 mt-3 text-center text-2xl font-semibold text-blue-900">Request Your Free Consultation</h2>
            <p className="mb-8 text-center text-gray-500">Reach out to discuss your project or request a consultation.</p>

            <div className="mb-8 flex flex-col items-center justify-center gap-4 text-gray-700 sm:flex-row sm:gap-8">
              <a href="mailto:mitikuhermanng@gmail.com" className="inline-flex items-center gap-2">
                <Mail className="h-5 w-5 text-blue-600" /> mitikuhermanng@gmail.com
              </a>
              <a href="tel:+27611170478" className="inline-flex items-center gap-2">
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
                className="rounded border border-gray-200 bg-white p-3"
                onChange={handleChange}
              />
              <input
                name="email"
                type="email"
                autoComplete="email"
                placeholder="Email"
                value={form.email}
                required
                className="rounded border border-gray-200 bg-white p-3"
                onChange={handleChange}
              />
              <div className="grid gap-3 sm:grid-cols-[minmax(0,220px)_minmax(0,1fr)]">
                <select
                  name="phoneCountry"
                  value={form.phoneCountry}
                  className="rounded border border-gray-200 bg-white p-3"
                  onChange={handleChange}
                  aria-label="Phone country"
                >
                  {phoneCountryOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label} {option.value}
                    </option>
                  ))}
                </select>
                <input
                  name="phoneNumber"
                  type="tel"
                  autoComplete="tel-national"
                  placeholder="Phone number"
                  value={form.phoneNumber}
                  required
                  className="rounded border border-gray-200 bg-white p-3"
                  onChange={handleChange}
                />
              </div>
              <textarea
                name="message"
                rows={5}
                placeholder="Tell us about your project"
                value={form.message}
                required
                className="resize-none rounded border border-gray-200 bg-white p-3"
                onChange={handleChange}
              />
              <button type="submit" className="rounded bg-blue-600 px-4 py-2 font-bold text-white transition-colors hover:bg-blue-700">
                Get In Touch Now
              </button>
            </form>
          </div>
        </section>
      ) : null}
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
            {blogPosts.map((post) => (
              <Card key={post.slug}>
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

  return (
    <>
      <PageIntro title={resourcesInfo.heading} intro={resourcesInfo.intro} eyebrow="Backlink-ready references" />
      <section className="section-code-bg section-bg-about px-6 py-16">
        <div className="mx-auto max-w-6xl space-y-8">
          {resources.map((resourceGroup) => (
            <div key={resourceGroup.category}>
              <h2 className="mb-4 text-2xl font-semibold text-blue-900">{resourceGroup.category}</h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {resourceGroup.items.map((item) => (
                  <Card key={item.href}>
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
              {bluetickNewsItems.map((item) => (
                <Card key={`${item.date}-${item.title}`}>
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
              {globalHealthNewsItems.map((item) => (
                <Card key={`${item.date}-${item.title}`}>
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

  return (
    <>
      <PageIntro title={productsInfo.heading} intro={productsInfo.intro} eyebrow="Digital health solutions" />
      <section className="section-code-bg section-bg-services section-code-bg--shine bg-[#f3f9ff] px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 rounded-xl bg-[#eaf4ff] p-6 md:p-8">
            <p className="text-sm leading-relaxed text-gray-700">{productsContent.partnershipMessage}</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {productsContent.products.map((product) => (
              <Card key={product.name} id="bluetick-health-emr">
                <CardContent className="p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center overflow-hidden rounded-lg bg-blue-100">
                    <img
                      src={`${import.meta.env.BASE_URL}${product.logo.replace(/^\//, '')}`}
                      alt={`${product.name} logo`}
                      width="40"
                      height="40"
                      className="h-10 w-10 object-contain"
                    />
                  </div>
                  <h2 className="text-lg font-semibold text-blue-900">{product.name}</h2>
                  <p className="mt-2 text-sm text-gray-500">{product.category}</p>
                  <p className="mt-4 text-sm leading-relaxed text-gray-600">{product.description}</p>
                  <span className="mt-5 inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-900">
                    {product.status}
                  </span>
                </CardContent>
              </Card>
            ))}
            <Card id="upcoming-digital-solutions">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold text-blue-900">Upcoming Digital Solutions</h2>
                <p className="mt-2 text-sm text-gray-500">In planning</p>
                <p className="mt-4 text-sm leading-relaxed text-gray-600">
                  Bluetick Health is preparing additional digital solutions to strengthen analytics, interoperability,
                  and decision support for health programmes.
                </p>
                <span className="mt-5 inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-900">
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
  const [form, setForm] = useState({ name: '', email: '', phoneCountry: phoneCountryOptions[0].value, phoneNumber: '', message: '' })
  const [activeHash, setActiveHash] = useState(window.location.hash)
  const pathname = normalizePath(window.location.pathname)
  const currentPost = useMemo(() => blogPosts.find((post) => getPostPath(post.slug) === pathname), [pathname])

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

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const subject = encodeURIComponent(`Consulting Inquiry from ${form.name}`)
    const body = encodeURIComponent(
      `Name: ${form.name}\nEmail: ${form.email}\nPhone: ${form.phoneCountry} ${form.phoneNumber}\n\nProject details:\n${form.message}`
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
      showConsultationSection={pathname === '/' && activeHash === '#contact'}
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
