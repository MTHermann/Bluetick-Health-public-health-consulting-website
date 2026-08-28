import { Button } from '../components/ui/button'

export default function ConsultingWebsite() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-cyan-900 font-sans">

      {/* Hero / Header */}
      <header className="relative flex flex-col items-center justify-center py-20 px-4 text-center overflow-hidden">

        {/* Background decorative R-code motif */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-5 select-none overflow-hidden"
        >
          <pre className="text-cyan-300 text-xs leading-5 whitespace-pre font-mono">
{`library(tidyverse)
bluetick_data <- read_csv("health_data.csv")
model <- glm(outcome ~ exposure + age + sex,
             data = bluetick_data,
             family = binomial())
summary(model)
ggplot(bluetick_data, aes(x = exposure, y = outcome)) +
  geom_point(colour = "#0891b2") +
  geom_smooth(method = "glm") +
  theme_minimal()
`.repeat(30)}
          </pre>
        </div>

        {/* Premium Branding Block */}
        <div className="relative z-10 bg-white rounded-2xl px-12 py-8 shadow-xl inline-flex flex-col items-center gap-2">
          <div className="flex items-center gap-3">
            <img
              src="/assets/bluetick-globe.png.png"
              alt="Bluetick Health globe logo"
              width="104"
              height="104"
              className="drop-shadow-md"
            />
            <div className="flex flex-col leading-none">
              <span className="text-blue-900 font-black text-4xl tracking-widest">BLUETICK</span>
              <span className="text-cyan-500 font-black text-4xl tracking-widest">HEALTH</span>
            </div>
          </div>
          <p className="text-blue-800 font-semibold text-xs tracking-[0.2em] mt-1">
            GLOBAL EVIDENCE. LOCAL IMPACT.
          </p>
        </div>

        {/* Tagline */}
        <h1 className="relative z-10 mt-10 text-white text-3xl md:text-5xl font-bold max-w-3xl leading-tight">
          Public Health Consulting for a Healthier World
        </h1>
        <p className="relative z-10 mt-4 text-blue-200 text-lg md:text-xl max-w-2xl">
          Evidence-based strategies, programme design, and health systems strengthening — tailored for Africa and beyond.
        </p>

        {/* CTA buttons */}
        <div className="relative z-10 mt-8 flex flex-wrap gap-4 justify-center">
          <a
            href="#services"
            className="bg-cyan-500 hover:bg-cyan-400 text-white font-semibold px-8 py-3 rounded-lg shadow-lg transition-colors"
          >
            Our Services
          </a>
          <a
            href="#contact"
            className="border border-white text-white hover:bg-white hover:text-blue-900 font-semibold px-8 py-3 rounded-lg transition-colors"
          >
            Contact Us
          </a>
        </div>
      </header>

      {/* Services */}
      <section id="services" className="py-20 px-4 max-w-6xl mx-auto">
        <h2 className="text-white text-3xl font-bold text-center mb-12">What We Do</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: '📊',
              title: 'Epidemiology & Research',
              body: 'Rigorous study design, data analysis, and interpretation to generate actionable public health evidence.',
            },
            {
              icon: '🌍',
              title: 'Health Systems Strengthening',
              body: 'Capacity building, policy advisory, and programme support across low- and middle-income settings.',
            },
            {
              icon: '📋',
              title: 'Monitoring & Evaluation',
              body: 'Results frameworks, evaluation designs, and real-time data systems that keep programmes on track.',
            },
          ].map((service) => (
            <div
              key={service.title}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-white hover:bg-white/20 transition-colors"
            >
              <div className="text-4xl mb-4">{service.icon}</div>
              <h3 className="font-bold text-xl mb-2">{service.title}</h3>
              <p className="text-blue-200 text-sm leading-relaxed">{service.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* About */}
      <section className="py-20 px-4 bg-blue-950/60">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-white text-3xl font-bold mb-6">About Bluetick Health</h2>
          <p className="text-blue-200 text-lg leading-relaxed">
            Bluetick Health is a South Africa-based public health consultancy combining global best practice
            with deep local knowledge. Our multidisciplinary team brings together epidemiologists, biostatisticians,
            health economists, and programme specialists to deliver solutions that are both scientifically sound
            and practically relevant.
          </p>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-20 px-4 max-w-2xl mx-auto text-center">
        <h2 className="text-white text-3xl font-bold mb-6">Get in Touch</h2>
        <p className="text-blue-200 mb-8">
          Ready to strengthen your public health programmes? We'd love to hear from you.
        </p>
        <a
          href="mailto:info@bluetickhealth.co.za"
          className="inline-block bg-cyan-500 hover:bg-cyan-400 text-white font-semibold px-10 py-4 rounded-lg shadow-lg transition-colors text-lg"
        >
          info@bluetickhealth.co.za
        </a>
      </section>

      {/* Footer */}
      <footer className="bg-blue-900 py-8 text-center text-sm text-blue-200">
        © {new Date().getFullYear()} Bluetick Health Consultancy. All rights reserved.
      </footer>
    </div>
  )
}