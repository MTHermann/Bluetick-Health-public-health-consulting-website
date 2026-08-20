import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Phone, BarChart3, Database, ClipboardList, FlaskConical, Linkedin, MessageCircle } from "lucide-react";

export default function ConsultingWebsite() {
  const whatsappLink = "https://wa.me/27785518486";
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 text-gray-800">

      {/* Hero */}
      <section className="bg-white py-20 px-6 text-center shadow-sm">
        <h1 className="text-4xl font-bold mb-2">Bluetick Health</h1>
        <h2 className="text-xl font-semibold text-gray-600 mb-4">
          Independent Statistical & Public Health Research Consultant
        </h2>
        <p className="text-lg max-w-3xl mx-auto text-gray-600">
          Supporting healthcare systems, clinical research, NGOs, and academic institutions with advanced statistical analysis and epidemiological insights.
        </p>

        <div className="mt-6 flex justify-center gap-3 flex-wrap">
          <Button asChild>
            <a href="#contact">Contact</a>
          </Button>

          <Button variant="outline" asChild>
            <a href={whatsappLink} target="_blank">WhatsApp</a>
          </Button>

          <Button variant="outline" asChild>
            <a href={linkedinLink} target="_blank">LinkedIn</a>
          </Button>
        </div>
      </section>

      {/* About */}
      <section className="py-16 px-6 max-w-5xl mx-auto">
        <h2 className="text-2xl font-semibold mb-4">About</h2>
        <p className="text-gray-700 leading-relaxed">
          Independent consultant specializing in public health research, healthcare analytics, and statistical modelling.
          We support evidence-based decision-making through analysis of large-scale health datasets, epidemiological studies,
          and advanced statistical methods.
        </p>
      </section>

      {/* Services */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-semibold mb-8">Services</h2>
          <div className="grid md:grid-cols-3 gap-6">

            <Card><CardContent className="p-6"><BarChart3 /><h3 className="font-semibold">Statistical Analysis</h3><p className="text-sm text-gray-600">Regression, survival, longitudinal and time-[...]
            <Card><CardContent className="p-6"><Database /><h3 className="font-semibold">Data Management</h3><p className="text-sm text-gray-600">REDCap design, cleaning, validation, and dataset m[...]
            <Card><CardContent className="p-6"><ClipboardList /><h3 className="font-semibold">Research Support</h3><p className="text-sm text-gray-600">Study design, M&E, reporting, and publicatio[...]
            <Card><CardContent className="p-6"><ClipboardList /><h3 className="font-semibold">Project Management</h3><p className="text-sm text-gray-600">SOP/Protocol development, Regulatory compl[...]

          </div>
        </div>
      </section>

      {/* Clinical Trials */}
      <section className="py-16 px-6 max-w-5xl mx-auto">
        <h2 className="text-2xl font-semibold flex items-center gap-2"><FlaskConical /> Clinical Trials Support</h2>
        <p className="text-gray-700 mt-2">
          Statistical and data support for clinical trials, including design, protocol development, Ethics submissions, randomization, site selection and oversight, patient recruitment strategy, i[...]
        </p>
      </section>

      {/* Projects */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-semibold mb-6">Projects & Publications</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card><CardContent className="p-6"><h3 className="font-semibold">Healthcare Data Analysis</h3><p className="text-sm text-gray-600">Regression and survival modelling for hospital datase[...]
            <Card><CardContent className="p-6"><h3 className="font-semibold">Public Health Evaluation</h3><p className="text-sm text-gray-600">Monitoring and evaluation of health interventions usi[...]
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-16 px-6 text-center">
        <h2 className="text-2xl font-semibold mb-6">Contact</h2>

        <div className="flex flex-col items-center gap-2 mb-6">
          <div className="flex items-center gap-2"><Mail /> mitikuhermanng@gmail.com</div>
          <div className="flex items-center gap-2"><Phone /> +27 611170478</div>
        </div>

        {/* Contact Form */}
        <form onSubmit={handleSubmit} className="max-w-md mx-auto flex flex-col gap-3">
          <input name="name" placeholder="Your Name" className="p-2 border rounded" onChange={handleChange} />
          <input name="email" placeholder="Your Email" className="p-2 border rounded" onChange={handleChange} />
          <textarea name="message" placeholder="Your Message" className="p-2 border rounded" onChange={handleChange} />
          <Button type="submit">Send Message</Button>
        </form>

        <div className="flex justify-center gap-4 mt-6">
          <a href={whatsappLink} target="_blank"><MessageCircle /></a>
          <a href={linkedinLink} target="_blank"><Linkedin /></a>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} Bluetick Health Consulting
      </footer>

    </div>
  );
}
