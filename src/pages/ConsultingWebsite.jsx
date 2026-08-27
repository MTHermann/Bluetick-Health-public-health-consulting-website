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
    stats: svgToDataUri(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 320 220'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop stop-color='#0f3b66'/><stop offset='1' stop-color='#0e7490'/></linearGradient></defs><rect width='320' height='220' fill='url(#g)'/><rect x='24' y='24' width='132' height='80' rx='10' fill='#e0f2fe' opacity='.35'/><polyline points='34,86 58,66 80,72 106,48 132,60' fill='none' stroke='#67e8f9' stroke-width='4'/><rect x='176' y='24' width='120' height='172' rx='10' fill='#f0f9ff' opacity='.28'/><rect x='194' y='52' width='18' height='120' fill='#7dd3fc' opacity='.75'/><rect x='222' y='88' width='18' height='84' fill='#38bdf8' opacity='.78'/><rect x='250' y='36' width='18' height='136' fill='#0ea5e9' opacity='.82'/><circle cx='78' cy='154' r='30' fill='none' stroke='#67e8f9' stroke-width='4' opacity='.45'/></svg>`),
    database: svgToDataUri(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 320 220'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop stop-color='#082f49'/><stop offset='1' stop-color='#155e75'/></linearGradient></defs><rect width='320' height='220' fill='url(#g)'/><ellipse cx='80' cy='68' rx='42' ry='14' fill='#a5f3fc' opacity='.45'/><rect x='38' y='68' width='84' height='82' fill='#a5f3fc' opacity='.35'/><ellipse cx='80' cy='150' rx='42' ry='14' fill='#a5f3fc' opacity='.45'/><ellipse cx='170' cy='84' rx='42' ry='14' fill='#7dd3fc' opacity='.45'/><rect x='128' y='84' width='84' height='66' fill='#7dd3fc' opacity='.3'/><ellipse cx='170' cy='150' rx='42' ry='14' fill='#7dd3fc' opacity='.45'/><rect x='222' y='34' width='70' height='130' rx='10' fill='#e0f2fe' opacity='.26'/><line x1='234' y1='58' x2='280' y2='58' stroke='#67e8f9' stroke-width='4'/><line x1='234' y1='82' x2='280' y2='82' stroke='#67e8f9' stroke-width='4'/><line x1='234' y1='106' x2='280' y2='106' stroke='#67e8f9' stroke-width='4'/><circle cx='257' cy='188' r='24' fill='none' stroke='#22d3ee' stroke-width='4' opacity='.5'/></svg>`),
    research: svgToDataUri(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 320 220'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop stop-color='#1e3a8a'/><stop offset='1' stop-color='#0e7490'/></linearGradient></defs><rect width='320' height='220' fill='url(#g)'/><rect x='26' y='30' width='132' height='152' rx='12' fill='#f0f9ff' opacity='.28'/><path d='M60 120c18-40 44-40 62 0' stroke='#67e8f9' stroke-width='5' fill='none'/><circle cx='72' cy='92' r='11' fill='#67e8f9' opacity='.85'/><circle cx='110' cy='92' r='11' fill='#22d3ee' opacity='.85'/><rect x='178' y='30' width='116' height='72' rx='10' fill='#e0f2fe' opacity='.28'/><polyline points='188,86 212,64 228,70 246,54 282,74' fill='none' stroke='#38bdf8' stroke-width='4'/><rect x='178' y='118' width='116' height='64' rx='10' fill='#e0f2fe' opacity='.22'/><path d='M214 150 l8 -16 l8 16 z' fill='#67e8f9' opacity='.85'/><rect x='242' y='138' width='18' height='24' rx='3' fill='#22d3ee' opacity='.85'/></svg>`),
    project: svgToDataUri(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 320 220'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop stop-color='#0b3b7a'/><stop offset='1' stop-color='#0e7490'/></linearGradient></defs><rect width='320' height='220' fill='url(#g)'/><rect x='26' y='26' width='268' height='64' rx='12' fill='#e0f2fe' opacity='.22'/><circle cx='54' cy='58' r='14' fill='#67e8f9' opacity='.8'/><circle cx='92' cy='58' r='14' fill='#22d3ee' opacity='.8'/><circle cx='130' cy='58' r='14' fill='#38bdf8' opacity='.8'/><rect x='26' y='108' width='268' height='86' rx='12' fill='#f0f9ff' opacity='.2'/><rect x='42' y='124' width='102' height='14' rx='7' fill='#67e8f9' opacity='.88'/><rect x='42' y='148' width='74' height='14' rx='7' fill='#22d3ee' opacity='.88'/><rect x='164' y='124' width='112' height='14' rx='7' fill='#38bdf8' opacity='.88'/><rect x='164' y='148' width='84' height='14' rx='7' fill='#7dd3fc' opacity='.88'/></svg>`),
    monitoring: svgToDataUri(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 320 220'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop stop-color='#0c4a6e'/><stop offset='1' stop-color='#155e75'/></linearGradient></defs><rect width='320' height='220' fill='url(#g)'/><path d='M0 172 Q70 142 140 170 T320 166 V220 H0 Z' fill='#67e8f9' opacity='.26'/><path d='M0 188 Q64 158 132 184 T320 182 V220 H0 Z' fill='#22d3ee' opacity='.22'/><circle cx='66' cy='118' r='12' fill='#e0f2fe' opacity='.88'/><rect x='56' y='132' width='20' height='30' rx='8' fill='#e0f2fe' opacity='.88'/><circle cx='116' cy='104' r='12' fill='#bae6fd' opacity='.88'/><rect x='106' y='118' width='20' height='32' rx='8' fill='#bae6fd' opacity='.88'/><circle cx='166' cy='116' r='12' fill='#7dd3fc' opacity='.88'/><rect x='156' y='130' width='20' height='30' rx='8' fill='#7dd3fc' opacity='.88'/><rect x='212' y='42' width='82' height='58' rx='10' fill='#f0f9ff' opacity='.24'/><polyline points='220,86 236,70 252,78 270,58 286,66' fill='none' stroke='#67e8f9' stroke-width='4'/></svg>`)
  };

  const sectionBackgrounds = {
    about: svgToDataUri(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1280 520'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop stop-color='#0f3b66'/><stop offset='1' stop-color='#0e7490'/></linearGradient></defs><rect width='1280' height='520' fill='url(#g)'/><rect x='70' y='80' width='420' height='300' rx='24' fill='#e0f2fe' opacity='.18'/><circle cx='190' cy='210' r='46' fill='#67e8f9' opacity='.75'/><rect x='156' y='252' width='68' height='86' rx='26' fill='#67e8f9' opacity='.75'/><circle cx='316' cy='188' r='44' fill='#22d3ee' opacity='.75'/><rect x='284' y='230' width='64' height='98' rx='24' fill='#22d3ee' opacity='.75'/><rect x='570' y='110' width='620' height='290' rx='24' fill='#f0f9ff' opacity='.16'/><rect x='618' y='154' width='248' height='170' rx='12' fill='#bae6fd' opacity='.34'/><polyline points='636,290 692,242 734,258 790,214 846,226' fill='none' stroke='#22d3ee' stroke-width='8'/><rect x='906' y='154' width='236' height='72' rx='12' fill='#bae6fd' opacity='.34'/><line x1='930' y1='188' x2='1118' y2='188' stroke='#67e8f9' stroke-width='10'/><line x1='930' y1='210' x2='1062' y2='210' stroke='#67e8f9' stroke-width='10'/></svg>`),
    services: svgToDataUri(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1600 700'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop stop-color='#0e3a62'/><stop offset='1' stop-color='#0f766e'/></linearGradient></defs><rect width='1600' height='700' fill='url(#g)'/><rect x='80' y='96' width='440' height='250' rx='26' fill='#e0f2fe' opacity='.18'/><polyline points='120,290 190,228 252,244 320,194 398,214 468,170' fill='none' stroke='#67e8f9' stroke-width='10'/><rect x='620' y='104' width='392' height='260' rx='26' fill='#e0f2fe' opacity='.18'/><ellipse cx='742' cy='170' rx='64' ry='20' fill='#7dd3fc' opacity='.55'/><rect x='678' y='170' width='128' height='122' fill='#7dd3fc' opacity='.34'/><ellipse cx='742' cy='292' rx='64' ry='20' fill='#7dd3fc' opacity='.55'/><rect x='1064' y='88' width='452' height='280' rx='26' fill='#f0f9ff' opacity='.14'/><rect x='1112' y='142' width='92' height='188' rx='16' fill='#67e8f9' opacity='.5'/><rect x='1236' y='172' width='92' height='158' rx='16' fill='#22d3ee' opacity='.5'/><rect x='1360' y='132' width='92' height='198' rx='16' fill='#38bdf8' opacity='.5'/><path d='M0 610 Q190 540 356 588 T760 582 T1160 592 T1600 576 V700 H0 Z' fill='#67e8f9' opacity='.18'/></svg>`),
    clinicalTrials: svgToDataUri(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1280 560'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop stop-color='#0b3b72'/><stop offset='1' stop-color='#0e7490'/></linearGradient></defs><rect width='1280' height='560' fill='url(#g)'/><rect x='90' y='90' width='510' height='360' rx='28' fill='#f0f9ff' opacity='.16'/><circle cx='210' cy='220' r='44' fill='#67e8f9' opacity='.78'/><rect x='178' y='262' width='64' height='108' rx='24' fill='#67e8f9' opacity='.78'/><circle cx='344' cy='220' r='44' fill='#22d3ee' opacity='.78'/><rect x='312' y='262' width='64' height='108' rx='24' fill='#22d3ee' opacity='.78'/><rect x='448' y='180' width='98' height='168' rx='14' fill='#bae6fd' opacity='.5'/><line x1='478' y1='220' x2='516' y2='220' stroke='#0f172a' stroke-width='8' opacity='.45'/><line x1='498' y1='200' x2='498' y2='240' stroke='#0f172a' stroke-width='8' opacity='.45'/><rect x='650' y='102' width='540' height='336' rx='28' fill='#e0f2fe' opacity='.15'/><rect x='700' y='154' width='210' height='90' rx='14' fill='#67e8f9' opacity='.42'/><polyline points='722,222 760,192 792,202 832,172 884,188' fill='none' stroke='#38bdf8' stroke-width='8'/><rect x='936' y='154' width='210' height='90' rx='14' fill='#67e8f9' opacity='.32'/><line x1='964' y1='186' x2='1118' y2='186' stroke='#67e8f9' stroke-width='9'/><line x1='964' y1='210' x2='1070' y2='210' stroke='#67e8f9' stroke-width='9'/><rect x='700' y='270' width='446' height='128' rx='16' fill='#67e8f9' opacity='.28'/></svg>`),
    projects: svgToDataUri(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1600 620'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop stop-color='#0f3b66'/><stop offset='1' stop-color='#0369a1'/></linearGradient></defs><rect width='1600' height='620' fill='url(#g)'/><rect x='110' y='92' width='1380' height='434' rx='30' fill='#f0f9ff' opacity='.14'/><rect x='182' y='156' width='430' height='286' rx='20' fill='#e0f2fe' opacity='.26'/><rect x='218' y='198' width='350' height='18' rx='9' fill='#67e8f9' opacity='.86'/><rect x='218' y='230' width='296' height='18' rx='9' fill='#22d3ee' opacity='.86'/><rect x='218' y='262' width='328' height='18' rx='9' fill='#38bdf8' opacity='.86'/><rect x='662' y='156' width='354' height='286' rx='20' fill='#e0f2fe' opacity='.22'/><circle cx='748' cy='248' r='56' fill='none' stroke='#67e8f9' stroke-width='12' opacity='.7'/><line x1='788' y1='286' x2='856' y2='354' stroke='#67e8f9' stroke-width='14' stroke-linecap='round' opacity='.7'/><rect x='1056' y='156' width='354' height='286' rx='20' fill='#e0f2fe' opacity='.22'/><rect x='1100' y='206' width='266' height='170' rx='14' fill='#bae6fd' opacity='.42'/><line x1='1128' y1='246' x2='1338' y2='246' stroke='#0ea5e9' stroke-width='10' opacity='.75'/><line x1='1128' y1='278' x2='1280' y2='278' stroke='#0ea5e9' stroke-width='10' opacity='.75'/></svg>`)
  };

  const emrBackground = svgToDataUri(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 560 360'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop stop-color='#0b3b72'/><stop offset='1' stop-color='#0e7490'/></linearGradient></defs><rect width='560' height='360' fill='url(#g)'/><rect x='40' y='38' width='480' height='284' rx='20' fill='#f0f9ff' opacity='.16'/><rect x='76' y='82' width='206' height='124' rx='12' fill='#bae6fd' opacity='.38'/><polyline points='92,178 128,150 152,158 182,132 248,146' fill='none' stroke='#22d3ee' stroke-width='7'/><rect x='304' y='82' width='176' height='124' rx='12' fill='#bae6fd' opacity='.3'/><line x1='326' y1='118' x2='458' y2='118' stroke='#67e8f9' stroke-width='8'/><line x1='326' y1='146' x2='430' y2='146' stroke='#67e8f9' stroke-width='8'/><rect x='76' y='228' width='404' height='66' rx='12' fill='#67e8f9' opacity='.26'/><circle cx='132' cy='262' r='18' fill='#67e8f9' opacity='.8'/><circle cx='188' cy='262' r='18' fill='#22d3ee' opacity='.8'/><circle cx='244' cy='262' r='18' fill='#38bdf8' opacity='.8'/></svg>`);

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
          backgroundImage: `linear-gradient(rgba(239, 246, 255, 0.68), rgba(236, 254, 255, 0.64)), ${sectionBackgrounds.about}`,
          backgroundSize: "cover, cover",
          backgroundRepeat: "no-repeat, no-repeat",
          backgroundPosition: "center, center",
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
          backgroundImage: `linear-gradient(rgba(239, 246, 255, 0.68), rgba(236, 254, 255, 0.64)), ${sectionBackgrounds.services}`,
          backgroundSize: "cover, cover",
          backgroundRepeat: "no-repeat, no-repeat",
          backgroundPosition: "center, center",
          backgroundColor: "#ffffff",
        }}
      >
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-blue-900 mb-10 border-b-2 border-blue-100 pb-3">Services</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

            <Card className="hover:shadow-lg transition-shadow duration-200 border-blue-50 overflow-hidden" style={{backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.67), rgba(255, 255, 255, 0.63)), ${serviceBackgrounds.stats}`, backgroundSize: "cover, cover"}}>
              <CardContent className="p-6 bg-white/70 backdrop-blur-sm">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="text-blue-700 w-5 h-5" />
                </div>
                <h3 className="font-semibold text-blue-900 mb-2">Statistical Analysis</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Regression, survival, longitudinal and time-series analysis.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-200 border-blue-50 overflow-hidden" style={{backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.67), rgba(255, 255, 255, 0.63)), ${serviceBackgrounds.database}`, backgroundSize: "cover, cover"}}>
              <CardContent className="p-6 bg-white/70 backdrop-blur-sm">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Database className="text-blue-700 w-5 h-5" />
                </div>
                <h3 className="font-semibold text-blue-900 mb-2">Data Management</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  REDCap design, cleaning, validation, training, and data governance support.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-200 border-blue-50 overflow-hidden" style={{backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.67), rgba(255, 255, 255, 0.63)), ${serviceBackgrounds.research}`, backgroundSize: "cover, cover"}}>
              <CardContent className="p-6 bg-white/70 backdrop-blur-sm">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <ClipboardList className="text-blue-700 w-5 h-5" />
                </div>
                <h3 className="font-semibold text-blue-900 mb-2">Research Support</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Study design, monitoring and evaluation, reporting, and publications.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-200 border-blue-50 overflow-hidden" style={{backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.67), rgba(255, 255, 255, 0.63)), ${serviceBackgrounds.project}`, backgroundSize: "cover, cover"}}>
              <CardContent className="p-6 bg-white/70 backdrop-blur-sm">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <ClipboardList className="text-blue-700 w-5 h-5" />
                </div>
                <h3 className="font-semibold text-blue-900 mb-2">Project Management</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  SOP and protocol development, regulatory compliance, and operational leadership.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-200 border-blue-50 overflow-hidden" style={{backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.67), rgba(255, 255, 255, 0.63)), ${serviceBackgrounds.monitoring}`, backgroundSize: "cover, cover"}}>
              <CardContent className="p-6 bg-white/70 backdrop-blur-sm">
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
          backgroundImage: `linear-gradient(rgba(239, 246, 255, 0.68), rgba(236, 254, 255, 0.64)), ${sectionBackgrounds.clinicalTrials}`,
          backgroundSize: "cover, cover",
          backgroundRepeat: "no-repeat, no-repeat",
          backgroundPosition: "center, center",
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
          backgroundImage: `linear-gradient(rgba(239, 246, 255, 0.68), rgba(236, 254, 255, 0.64)), ${sectionBackgrounds.projects}`,
          backgroundSize: "cover, cover",
          backgroundRepeat: "no-repeat, no-repeat",
          backgroundPosition: "center, center",
          backgroundColor: "#f0f9ff",
        }}
      >
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-blue-900 mb-10 border-b-2 border-blue-100 pb-3">Projects & Publications</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="hover:shadow-lg transition-shadow duration-200 overflow-hidden" style={{backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.67), rgba(255, 255, 255, 0.63)), ${emrBackground}`, backgroundSize: "cover, cover"}}>
              <CardContent className="p-6 bg-white/70 backdrop-blur-sm">
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
