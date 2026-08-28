import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  BarChart3,
  ClipboardList,
  Database,
  FlaskConical,
  Linkedin,
  Mail,
  Phone,
  TrendingUp,
} from 'lucide-react'

const services = [
  {
    icon: BarChart3,
    title: 'Statistical Analysis',
    body: 'Regression, survival, longitudinal and time-series analysis.',
  },
  {
    icon: Database,
    title: 'Data Management',
    body: 'REDCap design, cleaning, validation, training, and data governance support.',
  },
  {
    icon: ClipboardList,
    title: 'Research Support',
    body: 'Study design, monitoring and evaluation, reporting, and publications.',
  },
  {
    icon: ClipboardList,
    title: 'Project Management',
    body: 'SOP and protocol development, regulatory compliance, and operational leadership.',
  },
  {
    icon: TrendingUp,
    title: 'Monitoring & Evaluating Public Health Programs',
    body: 'Design and implementation of practical M&E frameworks to measure performance, outcomes, and impact.',
  },
  {
    icon: FlaskConical,
    title: 'Clinical Trials Support',
    body: 'Statistical and data support for protocol development, ethics, randomization, oversight, and interim analysis.',
  },
]

export default function ConsultingWebsite() {
  const linkedinLink = 'https://www.linkedin.com/in/mitiku-t-437bb0163/'
  const [form, setForm] = useState({ name: '', email: '', message: '' })

  useEffect(() => {
    document.title = 'Bluetick Health | Statistical & Public Health Research Consultancy'
    const meta = document.querySelector("meta[name='description']") || document.createElement('meta')
    meta.name = 'description'
    meta.content =
      'Independent statistical and public health research consultancy supporting health systems, clinical research, NGOs, and academic institutions.'
    document.head.appendChild(meta)
  }, [])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const mailto = `mailto:mitikuhermanng@gmail.com?subject=Consulting Inquiry from ${form.name}&body=Name: ${form.name}%0AEmail: ${form.email}%0A%0A${form.message}`
    window.location.href = mailto
  }

  return (
    <div className="min-h-screen bg-[#eaf4ff] text-gray-800">
      <section className="bg-gradient-to-b from-blue-900 to-blue-800 px-6 py-20 text-center">
        <div className="mb-8 flex justify-center">
          <div className="inline-flex flex-col items-center gap-2 rounded-2xl bg-white px-8 py-5 shadow-lg">
            <div className="flex items-center gap-3">
              <img
                src="/assets/bluetick-globe.png"
                alt="Bluetick Health globe logo"
                width="72"
                height="72"
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
            <a href="#contact">Get in Touch</a>
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

      <section className="px-6 py-16">
        <div className="mx-auto max-w-5xl rounded-xl bg-[#dff0ff] p-8 md:p-10">
          <h2 className="mb-4 text-2xl font-semibold text-blue-900">About</h2>
          <p className="leading-relaxed text-gray-700">
            Independent consultant specializing in public health research, healthcare analytics, and statistical modelling.
            We support evidence-based decision-making through analysis of large-scale health datasets, epidemiological
            studies, and advanced statistical methods.
          </p>
        </div>
      </section>

      <section id="services" className="bg-[#f3f9ff] px-6 py-16">
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

      <section className="px-6 py-16">
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
                  dashboards, and automated reporting. Funding and collaborative partnerships are welcomed to accelerate
                  development and launch.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section id="contact" className="bg-[#f3f9ff] px-6 py-16">
        <div className="mx-auto max-w-2xl">
          <h2 className="mb-8 text-center text-2xl font-semibold text-blue-900">Contact</h2>

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
              placeholder="Your Name"
              className="rounded border border-gray-200 bg-white p-3"
              onChange={handleChange}
            />
            <input
              name="email"
              type="email"
              placeholder="Your Email"
              className="rounded border border-gray-200 bg-white p-3"
              onChange={handleChange}
            />
            <textarea
              name="message"
              rows={5}
              placeholder="Your Message"
              className="resize-none rounded border border-gray-200 bg-white p-3"
              onChange={handleChange}
            />
            <Button type="submit">Send Message</Button>
          </form>
        </div>
      </section>

      <footer className="bg-blue-900 py-8 text-center text-sm text-blue-200">
        © {new Date().getFullYear()} Bluetick Health Consultancy. All rights reserved
      </footer>
    </div>
  )
}
