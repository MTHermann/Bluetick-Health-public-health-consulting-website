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

  // Background patterns for service cards
  const serviceBackgrounds = {
    stats: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Crect width='200' height='200' fill='%23f0f9ff'/%3E%3Ctext x='10' y='30' font-family='monospace' font-size='8' fill='%230284c7' opacity='0.15'%3Elm(y ~ x1 + x2)%3C/text%3E%3Ctext x='10' y='50' font-family='monospace' font-size='8' fill='%230284c7' opacity='0.15'%3Esummary(glm_model)%3C/text%3E%3Cpolyline points='20,100 40,80 60,90 80,60 100,75' fill='none' stroke='%230284c7' stroke-width='1' opacity='0.2'/%3E%3Ccircle cx='50' cy='150' r='20' fill='none' stroke='%230284c7' opacity='0.1'/%3E%3Cline x1='10' y1='180' x2='190' y2='180' stroke='%230284c7' stroke-width='1' opacity='0.15'/%3E%3C/svg%3E")`,
    
    database: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Crect width='200' height='200' fill='%23f0f9ff'/%3E%3Ctext x='10' y='30' font-family='monospace' font-size='8' fill='%230284c7' opacity='0.15'%3Edata %3C-%3E read.csv()%3C/text%3E%3Ctext x='10' y='50' font-family='monospace' font-size='8' fill='%230284c7' opacity='0.15'%3Evalidate(data)%3C/text%3E%3Crect x='30' y='80' width='40' height='60' fill='none' stroke='%230284c7' stroke-width='1' opacity='0.2'/%3E%3Crect x='80' y='85' width='40' height='60' fill='none' stroke='%230284c7' stroke-width='1' opacity='0.2'/%3E%3Crect x='130' y='80' width='40' height='60' fill='none' stroke='%230284c7' stroke-width='1' opacity='0.2'/%3E%3Cline x1='50' y1='75' x2='150' y2='75' stroke='%230284c7' stroke-width='1' opacity='0.15'/%3E%3C/svg%3E")`,
    
    research: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Crect width='200' height='200' fill='%23f0f9ff'/%3E%3Ctext x='10' y='30' font-family='monospace' font-size='8' fill='%230284c7' opacity='0.15'%3Estudy_design()%3C/text%3E%3Ctext x='10' y='50' font-family='monospace' font-size='8' fill='%230284c7' opacity='0.15'%3Eanalysis_report()%3C/text%3E%3Ccircle cx='60' cy='100' r='25' fill='none' stroke='%230284c7' stroke-width='1' opacity='0.2'/%3E%3Ccircle cx='140' cy='100' r='25' fill='none' stroke='%230284c7' stroke-width='1' opacity='0.2'/%3E%3Cline x1='85' y1='100' x2='115' y2='100' stroke='%230284c7' stroke-width='1' opacity='0.15'/%3E%3Cpolyline points='40,160 100,140 160,160' fill='none' stroke='%230284c7' stroke-width='1' opacity='0.2'/%3E%3C/svg%3E")`,
    
    project: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Crect width='200' height='200' fill='%23f0f9ff'/%3E%3Ctext x='10' y='30' font-family='monospace' font-size='8' fill='%230284c7' opacity='0.15'%3Egannt_chart()%3C/text%3E%3Ctext x='10' y='50' font-family='monospace' font-size='8' fill='%230284c7' opacity='0.15'%3EtimelineProject()%3C/text%3E%3Crect x='30' y='70' width='140' height='12' fill='none' stroke='%230284c7' stroke-width='1' opacity='0.2'/%3E%3Crect x='30' y='90' width='100' height='12' fill='none' stroke='%230284c7' stroke-width='1' opacity='0.2'/%3E%3Crect x='30' y='110' width='120' height='12' fill='none' stroke='%230284c7' stroke-width='1' opacity='0.2'/%3E%3Crect x='30' y='130' width='90' height='12' fill='none' stroke='%230284c7' stroke-width='1' opacity='0.2'/%3E%3Crect x='30' y='150' width='110' height='12' fill='none' stroke='%230284c7' stroke-width='1' opacity='0.2'/%3E%3C/svg%3E")`,
    
    monitoring: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Crect width='200' height='200' fill='%23f0f9ff'/%3E%3Ctext x='10' y='30' font-family='monospace' font-size='8' fill='%230284c7' opacity='0.15'%3Emonitoring_frame()%3C/text%3E%3Ctext x='10' y='50' font-family='monospace' font-size='8' fill='%230284c7' opacity='0.15'%3EevaluateProgram()%3C/text%3E%3Cpolyline points='20,130 50,90 80,110 110,70 140,95 170,60' fill='none' stroke='%230284c7' stroke-width='2' opacity='0.25'/%3E%3Ccircle cx='20' cy='130' r='3' fill='%230284c7' opacity='0.3'/%3E%3Ccircle cx='50' cy='90' r='3' fill='%230284c7' opacity='0.3'/%3E%3Ccircle cx='80' cy='110' r='3' fill='%230284c7' opacity='0.3'/%3E%3Ccircle cx='110' cy='70' r='3' fill='%230284c7' opacity='0.3'/%3E%3Ccircle cx='140' cy='95' r='3' fill='%230284c7' opacity='0.3'/%3E%3Ccircle cx='170' cy='60' r='3' fill='%230284c7' opacity='0.3'/%3E%3C/svg%3E")`
  };

  const emrBackground = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300' viewBox='0 0 300 300'%3E%3Crect width='300' height='300' fill='%23f0f9ff'/%3E%3Ctext x='15' y='35' font-family='monospace' font-size='9' fill='%230284c7' opacity='0.12'%3Eemr_database()%3C/text%3E%3Ctext x='15' y='60' font-family='monospace' font-size='9' fill='%230284c7' opacity='0.12'%3Eclinical_data %3C- collect()%3C/text%3E%3Ctext x='15' y='85' font-family='monospace' font-size='9' fill='%230284c7' opacity='0.12'%3Edashboard()%3C/text%3E%3Ctext x='15' y='110' font-family='monospace' font-size='9' fill='%230284c7' opacity='0.12'%3Egenerate_report()%3C/text%3E%3Crect x='50' y='140' width='200' height='120' fill='none' stroke='%230284c7' stroke-width='2' opacity='0.15'/%3E%3Cline x1='50' y1='160' x2='250' y2='160' stroke='%230284c7' stroke-width='1' opacity='0.15'/%3E%3Cline x1='50' y1='180' x2='250' y2='180' stroke='%230284c7' stroke-width='1' opacity='0.15'/%3E%3Cline x1='50' y1='200' x2='250' y2='200' stroke='%230284c7' stroke-width='1' opacity='0.15'/%3E%3Ccircle cx='75' cy='230' r='8' fill='none' stroke='%230284c7' stroke-width='1' opacity='0.2'/%3E%3Ccircle cx='150' cy='230' r='8' fill='none' stroke='%230284c7' stroke-width='1' opacity='0.2'/%3E%3Ccircle cx='225' cy='230' r='8' fill='none' stroke='%230284c7' stroke-width='1' opacity='0.2'/%3E%3C/svg%3E")`;

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
      <section 
        className="py-20 px-6 max-w-5xl mx-auto"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23ffffff'/%3E%3Ctext x='20' y='40' font-family='monospace' font-size='8' fill='%230284c7' opacity='0.08'%3E# Public Health Research%3C/text%3E%3Ctext x='20' y='60' font-family='monospace' font-size='8' fill='%230284c7' opacity='0.08'%3Elibrary(epidemiological)%3C/text%3E%3Ctext x='20' y='80' font-family='monospace' font-size='8' fill='%230284c7' opacity='0.08'%3Eanalyze_health_data()%3C/text%3E%3Ctext x='20' y='100' font-family='monospace' font-size='8' fill='%230284c7' opacity='0.08'%3Eevidence_based %3C- TRUE%3C/text%3E%3Ctext x='20' y='120' font-family='monospace' font-size='8' fill='%230284c7' opacity='0.08'%3Estatistical_methods()%3C/text%3E%3Ctext x='20' y='140' font-family='monospace' font-size='8' fill='%230284c7' opacity='0.08'%3Elarge_scale_datasets%3C/text%3E%3Cpolyline points='50,180 100,160 150,170 200,140 250,155 300,130' fill='none' stroke='%230284c7' stroke-width='1' opacity='0.1'/%3E%3Ccircle cx='100' cy='250' r='30' fill='none' stroke='%230284c7' opacity='0.08'/%3E%3C/svg%3E")`,
          backgroundSize: "cover",
          backgroundRepeat: "repeat",
          backgroundPosition: "top",
        }}
      >
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
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='500' viewBox='0 0 800 500'%3E%3Crect width='800' height='500' fill='%23f8fafc'/%3E%3Ctext x='30' y='50' font-family='monospace' font-size='10' fill='%230284c7' opacity='0.08'%3E# Statistical Services%3C/text%3E%3Ctext x='30' y='80' font-family='monospace' font-size='10' fill='%230284c7' opacity='0.08'%3Eservice_catalog()%3C/text%3E%3Ctext x='30' y='110' font-family='monospace' font-size='10' fill='%230284c7' opacity='0.08'%3Eregression %3C- lm(y ~ x)%3C/text%3E%3Ctext x='30' y='140' font-family='monospace' font-size='10' fill='%230284c7' opacity='0.08'%3Esurvival %3C- survfit()%3C/text%3E%3Ccircle cx='100' cy='300' r='60' fill='none' stroke='%230284c7' stroke-width='1' opacity='0.08'/%3E%3Cline x1='50' y1='150' x2='150' y2='150' stroke='%230284c7' stroke-width='1' opacity='0.08'/%3E%3Cline x1='80' y1='120' x2='120' y2='180' stroke='%230284c7' stroke-width='1' opacity='0.08'/%3E%3Crect x='300' y='100' width='80' height='120' fill='none' stroke='%230284c7' stroke-width='1' opacity='0.08'/%3E%3Cpolyline points='400,300 450,250 500,280 550,200' fill='none' stroke='%230284c7' stroke-width='1' opacity='0.08'/%3E%3Cpath d='M 600 400 L 650 350 L 700 380' fill='none' stroke='%230284c7' stroke-width='1' opacity='0.08'/%3E%3Crect x='50' y='350' width='100' height='20' fill='none' stroke='%230284c7' stroke-width='1' opacity='0.08'/%3E%3Crect x='50' y='385' width='100' height='20' fill='none' stroke='%230284c7' stroke-width='1' opacity='0.08'/%3E%3Crect x='50' y='420' width='100' height='20' fill='none' stroke='%230284c7' stroke-width='1' opacity='0.08'/%3E%3C/svg%3E")`,
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          backgroundColor: "#ffffff",
        }}
      >
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-blue-900 mb-10 border-b-2 border-blue-100 pb-3">Services</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

            <Card className="hover:shadow-lg transition-shadow duration-200 border-blue-50 overflow-hidden" style={{backgroundImage: serviceBackgrounds.stats, backgroundSize: "cover", backgroundAttachment: "fixed"}}>
              <CardContent className="p-6 bg-white/95 backdrop-blur-sm">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="text-blue-700 w-5 h-5" />
                </div>
                <h3 className="font-semibold text-blue-900 mb-2">Statistical Analysis</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Regression, survival, longitudinal and time-series analysis.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-200 border-blue-50 overflow-hidden" style={{backgroundImage: serviceBackgrounds.database, backgroundSize: "cover", backgroundAttachment: "fixed"}}>
              <CardContent className="p-6 bg-white/95 backdrop-blur-sm">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Database className="text-blue-700 w-5 h-5" />
                </div>
                <h3 className="font-semibold text-blue-900 mb-2">Data Management</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  REDCap design, cleaning, validation, training, and data governance support.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-200 border-blue-50 overflow-hidden" style={{backgroundImage: serviceBackgrounds.research, backgroundSize: "cover", backgroundAttachment: "fixed"}}>
              <CardContent className="p-6 bg-white/95 backdrop-blur-sm">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <ClipboardList className="text-blue-700 w-5 h-5" />
                </div>
                <h3 className="font-semibold text-blue-900 mb-2">Research Support</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Study design, monitoring and evaluation, reporting, and publications.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-200 border-blue-50 overflow-hidden" style={{backgroundImage: serviceBackgrounds.project, backgroundSize: "cover", backgroundAttachment: "fixed"}}>
              <CardContent className="p-6 bg-white/95 backdrop-blur-sm">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <ClipboardList className="text-blue-700 w-5 h-5" />
                </div>
                <h3 className="font-semibold text-blue-900 mb-2">Project Management</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  SOP and protocol development, regulatory compliance, and operational leadership.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-200 border-blue-50 overflow-hidden" style={{backgroundImage: serviceBackgrounds.monitoring, backgroundSize: "cover", backgroundAttachment: "fixed"}}>
              <CardContent className="p-6 bg-white/95 backdrop-blur-sm">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="text-blue-700 w-5 h-5" />
                </div>
                <h3 className="font-semibold text-blue-900 mb-2">Monitoring & Evaluating Public Health Programs</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
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
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='350' viewBox='0 0 400 350'%3E%3Crect width='400' height='350' fill='%23ffffff'/%3E%3Ctext x='20' y='40' font-family='monospace' font-size='8' fill='%230284c7' opacity='0.08'%3E# Clinical Trial Support%3C/text%3E%3Ctext x='20' y='60' font-family='monospace' font-size='8' fill='%230284c7' opacity='0.08'%3Eclinical_trial()%3C/text%3E%3Ctext x='20' y='80' font-family='monospace' font-size='8' fill='%230284c7' opacity='0.08'%3Erandomization()%3C/text%3E%3Ctext x='20' y='100' font-family='monospace' font-size='8' fill='%230284c7' opacity='0.08'%3Einterim_analysis()%3C/text%3E%3Ctext x='20' y='120' font-family='monospace' font-size='8' fill='%230284c7' opacity='0.08'%3Eethics_submission()%3C/text%3E%3Ccircle cx='100' cy='180' r='25' fill='none' stroke='%230284c7' stroke-width='1' opacity='0.1'/%3E%3Ccircle cx='200' cy='180' r='25' fill='none' stroke='%230284c7' stroke-width='1' opacity='0.1'/%3E%3Ccircle cx='300' cy='180' r='25' fill='none' stroke='%230284c7' stroke-width='1' opacity='0.1'/%3E%3Cline x1='125' y1='180' x2='175' y2='180' stroke='%230284c7' stroke-width='1' opacity='0.1'/%3E%3Cline x1='225' y1='180' x2='275' y2='180' stroke='%230284c7' stroke-width='1' opacity='0.1'/%3E%3Cpolyline points='40,280 100,250 160,280 220,240 280,270' fill='none' stroke='%230284c7' stroke-width='1' opacity='0.1'/%3E%3C/svg%3E")`,
          backgroundSize: "cover",
          backgroundRepeat: "repeat",
          backgroundPosition: "top",
        }}
      >
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
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='400' viewBox='0 0 800 400'%3E%3Crect width='800' height='400' fill='%23f0f9ff'/%3E%3Ctext x='20' y='40' font-family='monospace' font-size='11' fill='%230284c7' opacity='0.08'%3E# Projects %26 Publications%3C/text%3E%3Ctext x='20' y='70' font-family='monospace' font-size='11' fill='%230284c7' opacity='0.08'%3Eproject_list %3C- getProjects()%3C/text%3E%3Ctext x='20' y='100' font-family='monospace' font-size='11' fill='%230284c7' opacity='0.08'%3Epublicate(research_findings)%3C/text%3E%3Cpolyline points='100,300 200,250 300,280 400,200 500,240' fill='none' stroke='%230284c7' stroke-width='2' opacity='0.08'/%3E%3Crect x='600' y='200' width='150' height='150' fill='none' stroke='%230284c7' stroke-width='1' opacity='0.08'/%3E%3C/svg%3E")`,
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          backgroundColor: "#f0f9ff",
        }}
      >
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-blue-900 mb-10 border-b-2 border-blue-100 pb-3">Projects & Publications</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="hover:shadow-lg transition-shadow duration-200 overflow-hidden" style={{backgroundImage: emrBackground, backgroundSize: "cover", backgroundAttachment: "fixed"}}>
              <CardContent className="p-6 bg-white/95 backdrop-blur-sm">
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
