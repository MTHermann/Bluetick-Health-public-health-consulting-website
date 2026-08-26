import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Phone, BarChart3, Database, ClipboardList, FlaskConical, Linkedin, TrendingUp } from "lucide-react";

export default function ConsultingWebsite() {
  const linkedinLink = "https://www.linkedin.com/in/mitiku-t-437bb0163/";

  const [form, setForm] = useState({ name: "", email: "", message: "" });

  useEffect(() => {
    document.title = "Bluetick Health | Statistical & Public Health Consultant";
    const meta = document.querySelector("meta[name='description']") || document.createElement("meta");
    meta.name = "description";
    meta.content = "Independent consultant in statistics, public health research, clinical trials, and healthcare analytics.";
    document.head.appendChild(meta);
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const mailto = `mailto:mitikuhermanng@gmail.com?subject=Consulting Inquiry from ${form.name}&body=Name: ${form.name}%0AEmail: ${form.email}%0A%0A${form.message}`;
    window.location.href = mailto;
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">

      {/* Hero */}
      <section
        className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 py-24 px-6 text-center overflow-hidden"
        style={{
          backgroundImage: `
            url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400' viewBox='0 0 600 400'%3E%3Crect width='600' height='400' fill='none'/%3E%3Ctext x='10' y='30' font-family='monospace' font-size='11' fill='%23ffffff' opacity='0.07'%3Elibrary(tidyverse)%3C/text%3E%3Ctext x='10' y='50' font-family='monospace' font-size='11' fill='%23ffffff' opacity='0.07'%3Emodel %26lt;- lm(outcome ~ age + sex + exposure, data=df)%3C/text%3E%3Ctext x='10' y='70' font-family='monospace' font-size='11' fill='%23ffffff' opacity='0.07'%3Esummary(model)%3C/text%3E%3Ctext x='10' y='90' font-family='monospace' font-size='11' fill='%23ffffff' opacity='0.07'%3Ecoxph(Surv(time, event) ~ trt + strata(site), data=trial)%3C/text%3E%3Ctext x='10' y='110' font-family='monospace' font-size='11' fill='%23ffffff' opacity='0.07'%3Eggplot(df, aes(x=time, y=rate, color=group)) + geom_line()%3C/text%3E%3Ctext x='10' y='130' font-family='monospace' font-size='11' fill='%23ffffff' opacity='0.07'%3Eglm(cases ~ offset(log(pop)) + year, family=poisson)%3C/text%3E%3Ctext x='10' y='150' font-family='monospace' font-size='11' fill='%23ffffff' opacity='0.07'%3Econfint(model, level=0.95)%3C/text%3E%3Ccircle cx='520' cy='80' r='60' fill='none' stroke='%23ffffff' stroke-width='1' opacity='0.06'/%3E%3Ccircle cx='520' cy='80' r='40' fill='none' stroke='%23ffffff' stroke-width='1' opacity='0.06'/%3E%3Ccircle cx='520' cy='80' r='20' fill='none' stroke='%23ffffff' stroke-width='1' opacity='0.06'/%3E%3Cline x1='460' y1='80' x2='580' y2='80' stroke='%23ffffff' stroke-width='1' opacity='0.06'/%3E%3Cline x1='520' y1='20' x2='520' y2='140' stroke='%23ffffff' stroke-width='1' opacity='0.06'/%3E%3C/svg%3E"),
            linear-gradient(135deg, #1e3a5f 0%, #1e40af 50%, #1d4ed8 100%)
          `,
          backgroundSize: "cover, cover",
          backgroundRepeat: "no-repeat, no-repeat",
          backgroundBlendMode: "overlay",
        }}
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="bg-white rounded-2xl px-8 py-5 shadow-xl inline-flex flex-col items-center gap-2">
            {/* Logo mark + wordmark row */}
            <div className="flex items-center gap-3">
              {/* Globe + Checkmark SVG icon */}
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Bluetick Health logo mark">
                <circle cx="24" cy="24" r="22" fill="#1e3a8a" />
                <ellipse cx="24" cy="24" rx="9" ry="22" fill="none" stroke="#38bdf8" strokeWidth="1.5" />
                <ellipse cx="24" cy="24" rx="22" ry="9" fill="none" stroke="#38bdf8" strokeWidth="1.5" />
                <line x1="2" y1="24" x2="46" y2="24" stroke="#38bdf8" strokeWidth="1.5" />
                <line x1="24" y1="2" x2="24" y2="46" stroke="#38bdf8" strokeWidth="1.5" />
                <polyline points="14,25 21,32 35,18" stroke="#22d3ee" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {/* Wordmark */}
              <div className="flex flex-col leading-none">
                <span className="text-blue-900 font-black text-2xl tracking-widest uppercase">Bluetick</span>
                <span className="text-cyan-500 font-black text-2xl tracking-widest uppercase">Health</span>
              </div>
            </div>
            {/* Motto */}
            <p className="text-blue-800 font-semibold text-xs tracking-[0.2em] uppercase mt-1">
              Global Evidence. Local Impact.
            </p>
          </div>
        </div>

        <h1 className="text-5xl font-bold text-white mb-3 tracking-tight">Bluetick Health</h1>
        <h2 className="text-xl font-medium text-blue-200 mb-5">
          Independent Statistical & Public Health Research Consultant
        </h2>
        <p className="text-lg max-w-3xl mx-auto text-blue-100 leading-relaxed">
          Supporting healthcare systems, clinical research, NGOs, and academic institutions with advanced statistical analysis and epidemiological insights.
        </p>

        <div className="mt-8 flex justify-center gap-4 flex-wrap">
          <Button asChild className="bg-white text-blue-900 hover:bg-blue-50 font-semibold px-6 py-2 rounded-full shadow">
            <a href="#contact">Get in Touch</a>
          </Button>
          <Button variant="outline" asChild className="border-white text-white hover:bg-white hover:text-blue-900 font-semibold px-6 py-2 rounded-full">
            <a href={linkedinLink} target="_blank" rel="noreferrer">
              <Linkedin className="inline w-4 h-4 mr-1" /> LinkedIn
            </a>
          </Button>
        </div>
      </section>

      {/* About */}
      <section className="py-20 px-6 max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-blue-900 mb-5 border-b-2 border-blue-100 pb-3">About</h2>
        <p className="text-gray-700 leading-relaxed text-lg">
          Independent consultant specializing in public health research, healthcare analytics, and statistical modelling.
          We support evidence-based decision-making through analysis of large-scale health datasets, epidemiological studies,
          and advanced statistical methods.
        </p>
      </section>

      {/* Services */}
      <section
        className="py-20 px-6 border-y border-gray-100"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='500' viewBox='0 0 800 500'%3E%3Crect width='800' height='500' fill='%23f8fafc'/%3E%3Ccircle cx='100' cy='100' r='60' fill='none' stroke='%23bfdbfe' stroke-width='2'/%3E%3Ccircle cx='100' cy='100' r='40' fill='none' stroke='%23bfdbfe' stroke-width='1.5'/%3E%3Ccircle cx='100' cy='100' r='20' fill='none' stroke='%23bfdbfe' stroke-width='1'/%3E%3Crect x='640' y='50' width='120' height='80' rx='8' fill='none' stroke='%23bfdbfe' stroke-width='1.5'/%3E%3Cline x1='660' y1='90' x2='740' y2='90' stroke='%23bfdbfe' stroke-width='1'/%3E%3Cline x1='660' y1='100' x2='720' y2='100' stroke='%23bfdbfe' stroke-width='1'/%3E%3Cline x1='660' y1='110' x2='730' y2='110' stroke='%23bfdbfe' stroke-width='1'/%3E%3Cpolyline points='50,400 150,350 250,370 350,300 450,320 550,260 650,280 750,220' fill='none' stroke='%23bfdbfe' stroke-width='2'/%3E%3Crect x='50' y='420' width='20' height='40' fill='%23dbeafe' rx='2'/%3E%3Crect x='100' y='400' width='20' height='60' fill='%23dbeafe' rx='2'/%3E%3Crect x='150' y='430' width='20' height='30' fill='%23dbeafe' rx='2'/%3E%3Crect x='200' y='390' width='20' height='70' fill='%23dbeafe' rx='2'/%3E%3Crect x='250' y='410' width='20' height='50' fill='%23dbeafe' rx='2'/%3E%3C/svg%3E")`,
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          backgroundColor: "#ffffff",
        }}
      >
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-blue-900 mb-10 border-b-2 border-blue-100 pb-3">Services</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

            <Card className="hover:shadow-lg transition-shadow duration-200 border-blue-50">
              <CardContent className="p-6">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="text-blue-700 w-5 h-5" />
                </div>
                <h3 className="font-semibold text-blue-900 mb-2">Statistical Analysis</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Regression, survival, longitudinal and time-series analysis.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-200 border-blue-50">
              <CardContent className="p-6">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Database className="text-blue-700 w-5 h-5" />
                </div>
                <h3 className="font-semibold text-blue-900 mb-2">Data Management</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  REDCap design, cleaning, validation, training, and data governance support.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-200 border-blue-50">
              <CardContent className="p-6">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <ClipboardList className="text-blue-700 w-5 h-5" />
                </div>
                <h3 className="font-semibold text-blue-900 mb-2">Research Support</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Study design, monitoring and evaluation, reporting, and publications.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-200 border-blue-50">
              <CardContent className="p-6">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <ClipboardList className="text-blue-700 w-5 h-5" />
                </div>
                <h3 className="font-semibold text-blue-900 mb-2">Project Management</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  SOP and protocol development, regulatory compliance, and operational leadership.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-200 border-blue-50">
              <CardContent className="p-6">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="text-blue-700 w-5 h-5" />
                </div>
                <h3 className="font-semibold text-blue-900 mb-2">Monitoring & Evaluating Public Health Programs</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  We design and implement robust monitoring and evaluation (M&E) frameworks and systems to measure programme performance, outcomes, and impact. We work with programme teams and stakeholders to translate evidence into actionable insights that strengthen decision-making, improve programme delivery, and maximise impact.
                </p>
              </CardContent>
            </Card>

          </div>
        </div>
      </section>

      {/* Clinical Trials */}
      <section className="py-20 px-6 max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-blue-900 mb-5 border-b-2 border-blue-100 pb-3 flex items-center gap-3">
          <FlaskConical className="w-7 h-7 text-blue-700" /> Clinical Trials Support
        </h2>
        <p className="text-gray-700 mt-2 text-lg leading-relaxed">
          Statistical and data support for clinical trials, including design, protocol development,
          ethics submissions, randomization, site selection and oversight, patient recruitment
          strategy, and interim analysis.
        </p>
      </section>

      {/* Projects */}
      <section
        className="py-20 px-6 border-y border-gray-100"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='400' viewBox='0 0 800 400'%3E%3Crect width='800' height='400' fill='%23f0f9ff'/%3E%3Ctext x='20' y='30' font-family='monospace' font-size='11' fill='%2393c5fd' opacity='0.7'%3Elibrary(survival)%3C/text%3E%3Ctext x='20' y='50' font-family='monospace' font-size='11' fill='%2393c5fd' opacity='0.7'%3Efit %26lt;- survfit(Surv(time, status) ~ group, data=lung)%3C/text%3E%3Ctext x='20' y='70' font-family='monospace' font-size='11' fill='%2393c5fd' opacity='0.7'%3Eplot(fit, col=c('blue','red'), lty=1:2)%3C/text%3E%3Ctext x='20' y='90' font-family='monospace' font-size='11' fill='%2393c5fd' opacity='0.7'%3Elegend('topright', c('Group A','Group B'))%3C/text%3E%3Cpolyline points='500,50 540,80 560,60 600,100 640,70 680,110 720,85 760,120' fill='none' stroke='%2393c5fd' stroke-width='2' opacity='0.6'/%3E%3Ccircle cx='500' cy='50' r='3' fill='%2393c5fd' opacity='0.6'/%3E%3Ccircle cx='540' cy='80' r='3' fill='%2393c5fd' opacity='0.6'/%3E%3Ccircle cx='600' cy='100' r='3' fill='%2393c5fd' opacity='0.6'/%3E%3Ccircle cx='680' cy='110' r='3' fill='%2393c5fd' opacity='0.6'/%3E%3Ccircle cx='760' cy='120' r='3' fill='%2393c5fd' opacity='0.6'/%3E%3C/svg%3E")`,
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          backgroundColor: "#f0f9ff",
        }}
      >
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-blue-900 mb-10 border-b-2 border-blue-100 pb-3">Projects & Publications</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="hover:shadow-lg transition-shadow duration-200">
              <CardContent className="p-6">
                <h3 className="font-semibold text-blue-900 mb-2 text-lg">Bluetick Health EMR Platform</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Bluetick Health Electronic Medical Record (EMR) in Development stage.
                </p>
                <p className="text-sm text-gray-600 leading-relaxed mt-2">
                  Bluetick Health is an EMR platform designed for routine clinical data collection, real-time analytics, dashboards, and automated reporting. Funding and collaborative partnerships are welcomed to accelerate development and launch.
                </p>
                <p className="text-sm text-gray-600 leading-relaxed mt-2">
                  We welcome funding, technical partnerships, healthcare institutions, and research collaborations to accelerate platform development, testing, implementation, and launch.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-20 px-6 bg-gray-50">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-blue-900 mb-3">Contact</h2>
          <p className="text-gray-500 mb-8">Reach out to discuss your project or request a consultation.</p>

          <div className="flex flex-col sm:flex-row justify-center gap-6 mb-10">
            <a href="mailto:mitikuhermanng@gmail.com" className="flex items-center gap-2 text-gray-700 hover:text-blue-700 transition-colors">
              <Mail className="w-5 h-5 text-blue-600" /> mitikuhermanng@gmail.com
            </a>
            <a href="tel:+27611170478" className="flex items-center gap-2 text-gray-700 hover:text-blue-700 transition-colors">
              <Phone className="w-5 h-5 text-blue-600" /> +27 611170478
            </a>
          </div>

          {/* Contact Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-left">
            <input
              name="name"
              placeholder="Your Name"
              className="p-3 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800"
              onChange={handleChange}
            />
            <input
              name="email"
              type="email"
              placeholder="Your Email"
              className="p-3 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800"
              onChange={handleChange}
            />
            <textarea
              name="message"
              rows={5}
              placeholder="Your Message"
              className="p-3 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800 resize-none"
              onChange={handleChange}
            />
            <Button type="submit" className="bg-blue-800 hover:bg-blue-900 text-white font-semibold py-3 rounded-lg">
              Send Message
            </Button>
          </form>

          <div className="flex justify-center gap-4 mt-8">
            <a href={linkedinLink} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-blue-700 transition-colors">
              <Linkedin className="w-6 h-6" />
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-blue-900 py-8 text-center text-sm text-blue-200">
        © {new Date().getFullYear()} Bluetick Health Consulting · All rights reserved
      </footer>

    </div>
  );
}
