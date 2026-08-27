import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Phone, BarChart3, Database, ClipboardList, FlaskConical, Linkedin, TrendingUp } from "lucide-react";

export default function ConsultingWebsite() {
  const linkedinLink = "https://www.linkedin.com/in/mitiku-t-437bb0163/";

  const [form, setForm] = useState({ name: "", email: "", message: "" });

  useEffect(() => {
    document.title = "Bluetick Health | Statistical & Public Health Consultancy";
    const meta = document.querySelector("meta[name='description']") || document.createElement("meta");
    meta.name = "description";
    meta.content = "Independent consultancy in statistics, public health research, clinical trials, and healthcare analytics.";
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
            url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400' viewBox='0 0 600 400'%3E%3Crect width='600' height='400' fill='none'/%3E%3Ctext x='10' y='30' font-family='monospace' font-size='10' fill='%2338bdf8' opacity='0.07'%3Elm(y ~ x1 + x2)%3C/text%3E%3Ctext x='50' y='80' font-family='monospace' font-size='10' fill='%2338bdf8' opacity='0.07'%3Ecoxph(Surv(time, status))%3C/text%3E%3Ctext x='100' y='130' font-family='monospace' font-size='10' fill='%2338bdf8' opacity='0.07'%3Eggplot(data, aes()) +%3C/text%3E%3Ctext x='20' y='180' font-family='monospace' font-size='10' fill='%2338bdf8' opacity='0.07'%3Eglm(y ~ x, family=binomial)%3C/text%3E%3Ccircle cx='300' cy='200' r='80' fill='none' stroke='%2338bdf8' stroke-width='1' opacity='0.05'/%3E%3Cline x1='220' y1='200' x2='380' y2='200' stroke='%2338bdf8' stroke-width='1' opacity='0.05'/%3E%3Cline x1='300' y1='120' x2='300' y2='280' stroke='%2338bdf8' stroke-width='1' opacity='0.05'/%3E%3C/svg%3E"),
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
              {/* Globe image on the side */}
              <img
                src="/assets/bluetick-globe.png.png"
                alt="Bluetick Health globe logo"
                width="80"
                height="80"
                className="drop-shadow-md"
              />
              
              {/* Wordmark */}
              <div className="flex flex-col leading-none">
                <span className="text-blue-900 font-black text-2xl tracking-widest">BLUETICK</span>
                <span className="text-cyan-500 font-black text-2xl tracking-widest">HEALTH</span>
              </div>
            </div>
            {/* Motto */}
            <p className="text-blue-800 font-semibold text-xs tracking-[0.2em] mt-1">
              GLOBAL EVIDENCE. LOCAL IMPACT.
            </p>
          </div>
        </div>

        <h2 className="text-xl font-medium text-blue-200 mb-5">
          Independent Statistical & Public Health Research Consultancy
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
          Independent consultancy specializing in public health research, healthcare analytics, and statistical modelling.
          We support evidence-based decision-making through analysis of large-scale health datasets, epidemiological studies,
          and advanced statistical methods.
        </p>
      </section>

      {/* Services */}
      <section
        className="py-20 px-6 border-y border-gray-100"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='500' viewBox='0 0 800 500'%3E%3Crect width='800' height='500' fill='%23f8fafc'/%3E%3Ccircle cx='100' cy='80' r='60' fill='none' stroke='%230369a1' stroke-width='1' opacity='0.08'/%3E%3Cline x1='50' y1='150' x2='150' y2='150' stroke='%230369a1' stroke-width='1' opacity='0.08'/%3E%3Cline x1='80' y1='120' x2='120' y2='180' stroke='%230369a1' stroke-width='1' opacity='0.08'/%3E%3Crect x='300' y='100' width='80' height='120' fill='none' stroke='%230369a1' stroke-width='1' opacity='0.08'/%3E%3Cpolyline points='400,300 450,250 500,280 550,200' fill='none' stroke='%230369a1' stroke-width='1' opacity='0.08'/%3E%3Cpath d='M 600 400 L 650 350 L 700 380' fill='none' stroke='%230369a1' stroke-width='1' opacity='0.08'/%3E%3Crect x='50' y='350' width='100' height='20' fill='none' stroke='%230369a1' stroke-width='1' opacity='0.08'/%3E%3Crect x='50' y='385' width='100' height='20' fill='none' stroke='%230369a1' stroke-width='1' opacity='0.08'/%3E%3Crect x='50' y='420' width='100' height='20' fill='none' stroke='%230369a1' stroke-width='1' opacity='0.08'/%3E%3C/svg%3E")`,
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
                  We design and implement robust monitoring and evaluation (M&E) frameworks and systems to measure programme performance, outcomes, and impact. We work with programme teams and stakeholders to develop sustainable M&E systems.
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
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='400' viewBox='0 0 800 400'%3E%3Crect width='800' height='400' fill='%23f0f9ff'/%3E%3Ctext x='20' y='40' font-family='monospace' font-size='11' fill='%230284c7' opacity='0.06'%3Esurvfit(Surv(time, status) ~ group)%3C/text%3E%3Ctext x='30' y='80' font-family='monospace' font-size='11' fill='%230284c7' opacity='0.06'%3Ecoxph(Surv(time, status) ~ covariate)%3C/text%3E%3Ctext x='40' y='120' font-family='monospace' font-size='11' fill='%230284c7' opacity='0.06'%3Eplot(km_fit, main='KM Curve')%3C/text%3E%3Cpolyline points='100,300 200,250 300,280 400,200 500,240' fill='none' stroke='%2306b6d4' stroke-width='2' opacity='0.08'/%3E%3C/svg%3E")`,
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
                  Bluetick Health is an EMR platform designed for routine clinical data collection, real-time analytics, dashboards, and automated reporting.
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
        © {new Date().getFullYear()} Bluetick Health Consulting. All rights reserved
      </footer>

    </div>
  );
}
