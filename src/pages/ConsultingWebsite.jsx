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

  const svgToDataUri = (svg) => `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;

  // Healthcare-themed backgrounds
  const serviceBackgrounds = {
    stats: svgToDataUri(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 320 220'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop stop-color='#0f3b66'/><stop offset='1' stop-color='#0284c7' stop-opacity='0.1'/></linearGradient></defs><rect width='320' height='220' fill='url(#g)'/><text x='15' y='30' font-family='monospace' font-size='7' fill='%230284c7' opacity='0.15'>lm(outcome ~ predictor)</text><text x='15' y='45' font-family='monospace' font-size='7' fill='%230284c7' opacity='0.15'>glm(response ~ x)</text><text x='15' y='60' font-family='monospace' font-size='7' fill='%230284c7' opacity='0.15'>summary(model)</text><line x1='20' y1='100' x2='300' y2='100' stroke='%230284c7' stroke-width='1' opacity='0.08'/><circle cx='50' cy='140' r='12' fill='none' stroke='%230284c7' opacity='0.1' stroke-width='1'/><circle cx='100' cy='130' r='12' fill='none' stroke='%230284c7' opacity='0.1' stroke-width='1'/><circle cx='150' cy='150' r='12' fill='none' stroke='%230284c7' opacity='0.1' stroke-width='1'/><polyline points='50,140 100,130 150,150 200,120' fill='none' stroke='%230284c7' stroke-width='1.5' opacity='0.12'/></svg>`),
    database: svgToDataUri(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 320 220'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop stop-color='#082f49'/><stop offset='1' stop-color='#0284c7' stop-opacity='0.1'/></linearGradient></defs><rect width='320' height='220' fill='url(#g)'/><rect x='30' y='40' width='120' height='80' fill='none' stroke='%230284c7' stroke-width='1.5' opacity='0.15'/><line x1='30' y1='60' x2='150' y2='60' stroke='%230284c7' stroke-width='1' opacity='0.1'/><line x1='30' y1='80' x2='150' y2='80' stroke='%230284c7' stroke-width='1' opacity='0.1'/><line x1='30' y1='100' x2='150' y2='100' stroke='%230284c7' stroke-width='1' opacity='0.1'/><text x='170' y='55' font-family='monospace' font-size='7' fill='%230284c7' opacity='0.15'>data_clean()</text><text x='170' y='70' font-family='monospace' font-size='7' fill='%230284c7' opacity='0.15'>validate()</text><text x='170' y='85' font-family='monospace' font-size='7' fill='%230284c7' opacity='0.15'>merge()</text></svg>`),
    research: svgToDataUri(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 320 220'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop stop-color='#1e3a8a'/><stop offset='1' stop-color='#0284c7' stop-opacity='0.1'/></linearGradient></defs><rect width='320' height='220' fill='url(#g)'/><circle cx='60' cy='60' r='20' fill='none' stroke='%230284c7' stroke-width='1.5' opacity='0.15'/><circle cx='60' cy='60' r='30' fill='none' stroke='%230284c7' stroke-width='1' opacity='0.1'/><text x='15' y='140' font-family='monospace' font-size='7' fill='%230284c7' opacity='0.15'>study_design()</text><text x='15' y='155' font-family='monospace' font-size='7' fill='%230284c7' opacity='0.15'>ethics_approval()</text><text x='15' y='170' font-family='monospace' font-size='7' fill='%230284c7' opacity='0.15'>publish()</text></svg>`),
    project: svgToDataUri(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 320 220'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop stop-color='#0b3b7a'/><stop offset='1' stop-color='#0284c7' stop-opacity='0.1'/></linearGradient></defs><rect width='320' height='220' fill='url(#g)'/><rect x='40' y='50' width='30' height='40' fill='none' stroke='%230284c7' opacity='0.1' stroke-width='1'/><rect x='90' y='45' width='30' height='45' fill='none' stroke='%230284c7' opacity='0.15' stroke-width='1'/><rect x='140' y='60' width='30' height='30' fill='none' stroke='%230284c7' opacity='0.12' stroke-width='1'/><rect x='190' y='40' width='30' height='50' fill='none' stroke='%230284c7' opacity='0.1' stroke-width='1'/><text x='50' y='130' font-family='monospace' font-size='7' fill='%230284c7' opacity='0.15'>gantt()</text><text x='50' y='145' font-family='monospace' font-size='7' fill='%230284c7' opacity='0.15'>timeline()</text></svg>`),
    monitoring: svgToDataUri(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 320 220'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop stop-color='#0c4a6e'/><stop offset='1' stop-color='#0284c7' stop-opacity='0.1'/></linearGradient></defs><rect width='320' height='220' fill='url(#g)'/><polyline points='30,150 70,120 110,135 150,100 190,130 230,90 270,110' fill='none' stroke='%230284c7' stroke-width='2' opacity='0.15'/><circle cx='30' cy='150' r='3' fill='%230284c7' opacity='0.2'/><circle cx='70' cy='120' r='3' fill='%230284c7' opacity='0.2'/><circle cx='110' cy='135' r='3' fill='%230284c7' opacity='0.2'/><circle cx='150' cy='100' r='3' fill='%230284c7' opacity='0.2'/><text x='20' y='40' font-family='monospace' font-size='7' fill='%230284c7' opacity='0.15'>monitor()</text><text x='20' y='55' font-family='monospace' font-size='7' fill='%230284c7' opacity='0.15'>evaluate()</text><text x='20' y='70' font-family='monospace' font-size='7' fill='%230284c7' opacity='0.15'>impact()</text></svg>`),
  };

  const sectionBackgrounds = {
    about: svgToDataUri(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1280 520'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop stop-color='#0f3b66'/><stop offset='1' stop-color='#0284c7' stop-opacity='0.08'/></linearGradient></defs><rect width='1280' height='520' fill='url(#g)'/><text x='50' y='80' font-family='monospace' font-size='10' fill='%230284c7' opacity='0.12'># Public Health Research</text><text x='50' y='110' font-family='monospace' font-size='10' fill='%230284c7' opacity='0.12'>evidence_synthesis()</text><text x='50' y='140' font-family='monospace' font-size='10' fill='%230284c7' opacity='0.12'>epidemiology()</text><text x='50' y='170' font-family='monospace' font-size='10' fill='%230284c7' opacity='0.12'>policy_analysis()</text><line x1='50' y1='250' x2='1200' y2='250' stroke='%230284c7' stroke-width='1' opacity='0.06'/><circle cx='200' cy='350' r='40' fill='none' stroke='%230284c7' opacity='0.08' stroke-width='1'/><circle cx='600' cy='380' r='50' fill='none' stroke='%230284c7' opacity='0.1' stroke-width='1'/><circle cx='1000' cy='340' r='45' fill='none' stroke='%230284c7' opacity='0.07' stroke-width='1'/></svg>`),
    services: svgToDataUri(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1600 700'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop stop-color='#0e3a62'/><stop offset='1' stop-color='#0284c7' stop-opacity='0.08'/></linearGradient></defs><rect width='1600' height='700' fill='url(#g)'/><text x='100' y='100' font-family='monospace' font-size='12' fill='%230284c7' opacity='0.1'># Healthcare Services</text><text x='100' y='140' font-family='monospace' font-size='11' fill='%230284c7' opacity='0.1'>clinical_support()</text><text x='100' y='175' font-family='monospace' font-size='11' fill='%230284c7' opacity='0.1'>data_management()</text><text x='900' y='150' font-family='monospace' font-size='12' fill='%230284c7' opacity='0.1'>research_framework()</text><text x='900' y='190' font-family='monospace' font-size='11' fill='%230284c7' opacity='0.1'>analytics()</text><polyline points='200,400 400,350 600,380 800,320 1000,360 1200,310 1400,340' fill='none' stroke='%230284c7' stroke-width='1.5' opacity='0.08'/></svg>`),
    clinicalTrials: svgToDataUri(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1280 560'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop stop-color='#0b3b72'/><stop offset='1' stop-color='#0284c7' stop-opacity='0.08'/></linearGradient></defs><rect width='1280' height='560' fill='url(#g)'/><text x='50' y='80' font-family='monospace' font-size='11' fill='%230284c7' opacity='0.12'># Clinical Trial Analysis</text><text x='50' y='115' font-family='monospace' font-size='10' fill='%230284c7' opacity='0.12'>randomization()</text><text x='50' y='145' font-family='monospace' font-size='10' fill='%230284c7' opacity='0.12'>stratified_analysis()</text><text x='50' y='175' font-family='monospace' font-size='10' fill='%230284c7' opacity='0.12'>survival_curve()</text><text x='50' y='205' font-family='monospace' font-size='10' fill='%230284c7' opacity='0.12'>interim_analysis()</text><text x='700' y='100' font-family='monospace' font-size='10' fill='%230284c7' opacity='0.1'>protocol_development()</text><text x='700' y='135' font-family='monospace' font-size='10' fill='%230284c7' opacity='0.1'>safety_monitoring()</text><circle cx='400' cy='350' r='35' fill='none' stroke='%230284c7' opacity='0.1' stroke-width='1.5'/><circle cx='650' cy='380' r='40' fill='none' stroke='%230284c7' opacity='0.08' stroke-width='1'/><circle cx='900' cy='340' r='38' fill='none' stroke='%230284c7' opacity='0.09' stroke-width='1'/></svg>`),
    projects: svgToDataUri(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1600 620'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop stop-color='#0f3b66'/><stop offset='1' stop-color='#0284c7' stop-opacity='0.08'/></linearGradient></defs><rect width='1600' height='620' fill='url(#g)'/><text x='80' y='90' font-family='monospace' font-size='12' fill='%230284c7' opacity='0.11'># EMR Implementation</text><text x='80' y='130' font-family='monospace' font-size='11' fill='%230284c7' opacity='0.11'>emr_database()</text><text x='80' y='165' font-family='monospace' font-size='11' fill='%230284c7' opacity='0.11'>dashboard_analytics()</text><text x='900' y='110' font-family='monospace' font-size='11' fill='%230284c7' opacity='0.1'>clinical_workflows()</text><text x='900' y='150' font-family='monospace' font-size='11' fill='%230284c7' opacity='0.1'>data_integration()</text><rect x='150' y='300' width='200' height='150' fill='none' stroke='%230284c7' stroke-width='1.5' opacity='0.09'/><rect x='500' y='320' width='180' height='130' fill='none' stroke='%230284c7' stroke-width='1.5' opacity='0.1'/><rect x='850' y='310' width='190' height='140' fill='none' stroke='%230284c7' stroke-width='1.5' opacity='0.08'/></svg>`),
    contact: svgToDataUri(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1600 700'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop stop-color='#0b3b72'/><stop offset='1' stop-color='#0284c7' stop-opacity='0.08'/></linearGradient></defs><rect width='1600' height='700' fill='url(#g)'/><text x='80' y='100' font-family='monospace' font-size='12' fill='%230284c7' opacity='0.12'># Regression Analysis</text><text x='80' y='140' font-family='monospace' font-size='10' fill='%230284c7' opacity='0.12'>model &lt;- lm(outcome ~ predictor)</text><text x='80' y='170' font-family='monospace' font-size='10' fill='%230284c7' opacity='0.12'>glm(response ~ x, family=binomial)</text><text x='80' y='200' font-family='monospace' font-size='10' fill='%230284c7' opacity='0.12'>summary(model)</text><text x='900' y='100' font-family='monospace' font-size='12' fill='%230284c7' opacity='0.11'># Survival Analysis</text><text x='900' y='140' font-family='monospace' font-size='10' fill='%230284c7' opacity='0.11'>surv_obj &lt;- Surv(time, event)</text><text x='900' y='170' font-family='monospace' font-size='10' fill='%230284c7' opacity='0.11'>survfit(Surv(time,event)~group)</text><text x='900' y='200' font-family='monospace' font-size='10' fill='%230284c7' opacity='0.11'>coxph(Surv(time,event)~covariate)</text><text x='80' y='290' font-family='monospace' font-size='10' fill='%230284c7' opacity='0.1'>confint(model)</text><text x='80' y='320' font-family='monospace' font-size='10' fill='%230284c7' opacity='0.1'>predict(model, newdata)</text><polyline points='100,450 300,400 500,430 700,380 900,420' fill='none' stroke='%230284c7' stroke-width='1.5' opacity='0.08'/><line x1='1100' y1='450' x2='1500' y2='450' stroke='%230284c7' stroke-width='1' opacity='0.06'/></svg>`),
  };

  const emrBackground = svgToDataUri(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 560 360'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop stop-color='#0b3b72'/><stop offset='1' stop-color='#0284c7' stop-opacity='0.1'/></linearGradient></defs><rect width='560' height='360' fill='url(#g)'/><text x='25' y='40' font-family='monospace' font-size='9' fill='%230284c7' opacity='0.12'>emr_database()</text><text x='25' y='65' font-family='monospace' font-size='9' fill='%230284c7' opacity='0.12'>clinical_data &lt;- collect()</text><text x='25' y='90' font-family='monospace' font-size='9' fill='%230284c7' opacity='0.12'>dashboard()</text><text x='25' y='115' font-family='monospace' font-size='9' fill='%230284c7' opacity='0.12'>generate_report()</text><rect x='60' y='150' width='220' height='130' fill='none' stroke='%230284c7' stroke-width='2' opacity='0.15'/><line x1='60' y1='170' x2='280' y2='170' stroke='%230284c7' stroke-width='1' opacity='0.15'/><line x1='60' y1='190' x2='280' y2='190' stroke='%230284c7' stroke-width='1' opacity='0.15'/><line x1='60' y1='210' x2='280' y2='210' stroke='%230284c7' stroke-width='1' opacity='0.15'/><circle cx='85' cy='250' r='8' fill='none' stroke='%230284c7' stroke-width='1' opacity='0.2'/><circle cx='170' cy='250' r='8' fill='none' stroke='%230284c7' stroke-width='1' opacity='0.2'/><circle cx='255' cy='250' r='8' fill='none' stroke='%230284c7' stroke-width='1' opacity='0.2'/></svg>`);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">

      {/* Hero */}
      <section
        className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 py-24 px-6 text-center overflow-hidden"
        style={{
          backgroundImage: `
            url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400' viewBox='0 0 600 400'%3E%3Crect width='600' height='400' fill='none'/%3E%3Ctext x='10' y='30' font-family='monospace' font-size='8' fill='%230f9488' opacity='0.03'%3E# Statistical Excellence%3C/text%3E%3Ctext x='10' y='60' font-family='monospace' font-size='8' fill='%230f9488' opacity='0.03'%3Edata_analysis()%3C/text%3E%3Ctext x='10' y='90' font-family='monospace' font-size='8' fill='%230f9488' opacity='0.03'%3Ehealth_research()%3C/text%3E%3C/svg%3E"),
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

        <h2 className="text-2xl font-bold text-white mb-5 drop-shadow-lg">
          Independent Statistical & Public Health Research Consultancy
        </h2>
        <p className="text-lg max-w-3xl mx-auto text-white font-semibold leading-relaxed drop-shadow-md">
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
      <section 
        className="py-20 px-6 max-w-5xl mx-auto"
        style={{
          backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.75), rgba(255, 255, 255, 0.72)), ${sectionBackgrounds.about}`,
          backgroundSize: "cover, cover",
          backgroundRepeat: "no-repeat, no-repeat",
          backgroundPosition: "center, center",
        }}
      >
        <h2 className="text-3xl font-bold text-blue-900 mb-5 border-b-2 border-blue-100 pb-3">About</h2>
        <p className="text-gray-800 font-semibold leading-relaxed text-lg">
          Independent consultancy specializing in public health research, healthcare analytics, and statistical modelling.
          We support evidence-based decision-making through analysis of large-scale health datasets, epidemiological studies,
          and advanced statistical methods.
        </p>
      </section>

      {/* Services */}
      <section
        className="py-20 px-6 border-y border-gray-100"
        style={{
          backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.75), rgba(255, 255, 255, 0.72)), ${sectionBackgrounds.services}`,
          backgroundSize: "cover, cover",
          backgroundRepeat: "no-repeat, no-repeat",
          backgroundPosition: "center, center",
          backgroundColor: "#ffffff",
        }}
      >
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-blue-900 mb-10 border-b-2 border-blue-100 pb-3">Services</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

            <Card className="hover:shadow-lg transition-shadow duration-200 border-blue-50 overflow-hidden" style={{backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.75), rgba(255, 255, 255, 0.72)), ${serviceBackgrounds.stats}`}}>
              <CardContent className="p-6 bg-white/75 backdrop-blur-sm">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="text-blue-700 w-5 h-5" />
                </div>
                <h3 className="font-semibold text-blue-900 mb-2">Statistical Analysis</h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  Regression, survival, longitudinal and time-series analysis.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-200 border-blue-50 overflow-hidden" style={{backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.75), rgba(255, 255, 255, 0.72)), ${serviceBackgrounds.database}`}}>
              <CardContent className="p-6 bg-white/75 backdrop-blur-sm">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Database className="text-blue-700 w-5 h-5" />
                </div>
                <h3 className="font-semibold text-blue-900 mb-2">Data Management</h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  REDCap design, cleaning, validation, training, and data governance support.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-200 border-blue-50 overflow-hidden" style={{backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.75), rgba(255, 255, 255, 0.72)), ${serviceBackgrounds.research}`}}>
              <CardContent className="p-6 bg-white/75 backdrop-blur-sm">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <ClipboardList className="text-blue-700 w-5 h-5" />
                </div>
                <h3 className="font-semibold text-blue-900 mb-2">Research Support</h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  Study design, monitoring and evaluation, reporting, and publications.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-200 border-blue-50 overflow-hidden" style={{backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.75), rgba(255, 255, 255, 0.72)), ${serviceBackgrounds.project}`}}>
              <CardContent className="p-6 bg-white/75 backdrop-blur-sm">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <ClipboardList className="text-blue-700 w-5 h-5" />
                </div>
                <h3 className="font-semibold text-blue-900 mb-2">Project Management</h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  SOP and protocol development, regulatory compliance, and operational leadership.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-200 border-blue-50 overflow-hidden" style={{backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.75), rgba(255, 255, 255, 0.72)), ${serviceBackgrounds.monitoring}`}}>
              <CardContent className="p-6 bg-white/75 backdrop-blur-sm">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="text-blue-700 w-5 h-5" />
                </div>
                <h3 className="font-semibold text-blue-900 mb-2">Monitoring & Evaluating Public Health Programs</h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  We design and implement robust monitoring and evaluation (M&E) frameworks and systems to measure programme performance, outcomes, and impact.
                </p>
              </CardContent>
            </Card>

          </div>
        </div>
      </section>

      {/* Clinical Trials */}
      <section 
        className="py-20 px-6 max-w-5xl mx-auto"
        style={{
          backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.75), rgba(255, 255, 255, 0.72)), ${sectionBackgrounds.clinicalTrials}`,
          backgroundSize: "cover, cover",
          backgroundRepeat: "no-repeat, no-repeat",
          backgroundPosition: "center, center",
        }}
      >
        <h2 className="text-3xl font-bold text-blue-900 mb-5 border-b-2 border-blue-100 pb-3 flex items-center gap-3">
          <FlaskConical className="w-7 h-7 text-blue-700" /> Clinical Trials Support
        </h2>
        <p className="text-gray-800 font-semibold mt-2 text-lg leading-relaxed">
          Statistical and data support for clinical trials, including design, protocol development,
          ethics submissions, randomization, site selection and oversight, patient recruitment
          strategy, and interim analysis.
        </p>
      </section>

      {/* Projects */}
      <section
        className="py-20 px-6 border-y border-gray-100"
        style={{
          backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.75), rgba(255, 255, 255, 0.72)), ${sectionBackgrounds.projects}`,
          backgroundSize: "cover, cover",
          backgroundRepeat: "no-repeat, no-repeat",
          backgroundPosition: "center, center",
          backgroundColor: "#f0f9ff",
        }}
      >
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-blue-900 mb-10 border-b-2 border-blue-100 pb-3">Projects & Publications</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="hover:shadow-lg transition-shadow duration-200 overflow-hidden" style={{backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.75), rgba(255, 255, 255, 0.72)), ${emrBackground}`}}>
              <CardContent className="p-6 bg-white/75 backdrop-blur-sm">
                <h3 className="font-semibold text-blue-900 mb-2 text-lg">Bluetick Health EMR Platform</h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  Bluetick Health Electronic Medical Record (EMR) in Development stage.
                </p>
                <p className="text-sm text-gray-700 leading-relaxed mt-2">
                  Bluetick Health is an EMR platform designed for routine clinical data collection, real-time analytics, dashboards, and automated reporting.
                </p>
                <p className="text-sm text-gray-700 leading-relaxed mt-2">
                  We welcome funding, technical partnerships, healthcare institutions, and research collaborations to accelerate platform development, testing, implementation, and launch.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section
        id="contact"
        className="py-20 px-6"
        style={{
          backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.76), rgba(255, 255, 255, 0.73)), ${sectionBackgrounds.contact}`,
          backgroundSize: "cover, cover",
          backgroundRepeat: "no-repeat, no-repeat",
          backgroundPosition: "center, center",
          backgroundColor: "#eff6ff",
        }}
      >
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-blue-900 mb-3">Contact</h2>
          <p className="text-gray-700 font-semibold mb-8">Reach out to discuss your project or request a consultation.</p>

          <div className="flex flex-col sm:flex-row justify-center gap-6 mb-10">
            <a href="mailto:mitikuhermanng@gmail.com" className="flex items-center gap-2 text-gray-800 font-semibold hover:text-blue-700 transition-colors">
              <Mail className="w-5 h-5 text-blue-600" /> mitikuhermanng@gmail.com
            </a>
            <a href="tel:+27611170478" className="flex items-center gap-2 text-gray-800 font-semibold hover:text-blue-700 transition-colors">
              <Phone className="w-5 h-5 text-blue-600" /> +27 611170478
            </a>
          </div>

          {/* Contact Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-left">
            <input
              name="name"
              placeholder="Your Name"
              className="p-3 border border-gray-200 rounded-lg bg-white/80 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800"
              onChange={handleChange}
            />
            <input
              name="email"
              type="email"
              placeholder="Your Email"
              className="p-3 border border-gray-200 rounded-lg bg-white/80 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800"
              onChange={handleChange}
            />
            <textarea
              name="message"
              rows={5}
              placeholder="Your Message"
              className="p-3 border border-gray-200 rounded-lg bg-white/80 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800 resize-none"
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
