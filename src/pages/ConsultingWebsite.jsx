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

  // Healthcare-themed SVG background illustrations for service cards
  const serviceBackgrounds = {
    // Statistical Analysis: healthcare data charts, vital-signs monitor, bar chart with medical cross
    stats: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='220' viewBox='0 0 300 220'%3E%3Crect width='300' height='220' fill='%23f0f9ff'/%3E%3C!-- ECG heartbeat line --%3E%3Cpolyline points='10,90 40,90 55,55 65,125 75,90 100,90 110,70 120,110 130,90 200,90' fill='none' stroke='%230284c7' stroke-width='2' opacity='0.22'/%3E%3C!-- Bar chart --%3E%3Crect x='210' y='120' width='14' height='60' rx='2' fill='%230284c7' opacity='0.14'/%3E%3Crect x='230' y='100' width='14' height='80' rx='2' fill='%230284c7' opacity='0.14'/%3E%3Crect x='250' y='80' width='14' height='100' rx='2' fill='%230284c7' opacity='0.14'/%3E%3Crect x='270' y='110' width='14' height='70' rx='2' fill='%230284c7' opacity='0.14'/%3E%3Cline x1='205' y1='182' x2='290' y2='182' stroke='%230284c7' stroke-width='1' opacity='0.18'/%3E%3C!-- Medical cross --%3E%3Crect x='22' y='140' width='10' height='30' rx='2' fill='%230284c7' opacity='0.14'/%3E%3Crect x='14' y='148' width='26' height='10' rx='2' fill='%230284c7' opacity='0.14'/%3E%3C!-- Trend line with dots --%3E%3Cpolyline points='30,195 70,178 110,185 150,165 190,170' fill='none' stroke='%230ea5e9' stroke-width='1.5' opacity='0.2' stroke-dasharray='4,3'/%3E%3Ccircle cx='30' cy='195' r='3' fill='%230ea5e9' opacity='0.22'/%3E%3Ccircle cx='70' cy='178' r='3' fill='%230ea5e9' opacity='0.22'/%3E%3Ccircle cx='110' cy='185' r='3' fill='%230ea5e9' opacity='0.22'/%3E%3Ccircle cx='150' cy='165' r='3' fill='%230ea5e9' opacity='0.22'/%3E%3Ccircle cx='190' cy='170' r='3' fill='%230ea5e9' opacity='0.22'/%3E%3C!-- Stethoscope outline --%3E%3Ccircle cx='160' cy='45' r='18' fill='none' stroke='%230284c7' stroke-width='1.5' opacity='0.18'/%3E%3Cpath d='M160 27 Q155 10 145 12 Q138 14 140 22' fill='none' stroke='%230284c7' stroke-width='1.5' opacity='0.18'/%3E%3Ccircle cx='140' cy='25' r='4' fill='none' stroke='%230284c7' stroke-width='1.5' opacity='0.18'/%3E%3C/svg%3E")`,

    // Data Management: EMR screen, database cylinders, medical records
    database: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='220' viewBox='0 0 300 220'%3E%3Crect width='300' height='220' fill='%23f0f9ff'/%3E%3C!-- Monitor / screen --%3E%3Crect x='60' y='40' width='130' height='90' rx='6' fill='none' stroke='%230284c7' stroke-width='2' opacity='0.2'/%3E%3Crect x='65' y='45' width='120' height='80' rx='3' fill='%230284c7' opacity='0.05'/%3E%3Cline x1='65' y1='60' x2='185' y2='60' stroke='%230284c7' stroke-width='1' opacity='0.18'/%3E%3Cline x1='65' y1='75' x2='185' y2='75' stroke='%230284c7' stroke-width='1' opacity='0.12'/%3E%3Cline x1='65' y1='90' x2='185' y2='90' stroke='%230284c7' stroke-width='1' opacity='0.12'/%3E%3Cline x1='65' y1='105' x2='185' y2='105' stroke='%230284c7' stroke-width='1' opacity='0.12'/%3E%3Cline x1='120' y1='45' x2='120' y2='125' stroke='%230284c7' stroke-width='1' opacity='0.12'/%3E%3C!-- Screen stand --%3E%3Cline x1='125' y1='130' x2='125' y2='150' stroke='%230284c7' stroke-width='2' opacity='0.18'/%3E%3Cline x1='105' y1='150' x2='145' y2='150' stroke='%230284c7' stroke-width='2' opacity='0.18'/%3E%3C!-- Database cylinders --%3E%3Cellipse cx='240' cy='80' rx='22' ry='8' fill='none' stroke='%230284c7' stroke-width='1.5' opacity='0.2'/%3E%3Cline x1='218' y1='80' x2='218' y2='115' stroke='%230284c7' stroke-width='1.5' opacity='0.2'/%3E%3Cline x1='262' y1='80' x2='262' y2='115' stroke='%230284c7' stroke-width='1.5' opacity='0.2'/%3E%3Cellipse cx='240' cy='115' rx='22' ry='8' fill='none' stroke='%230284c7' stroke-width='1.5' opacity='0.2'/%3E%3Cellipse cx='240' cy='135' rx='22' ry='8' fill='none' stroke='%230284c7' stroke-width='1.5' opacity='0.2'/%3E%3Cline x1='218' y1='115' x2='218' y2='135' stroke='%230284c7' stroke-width='1.5' opacity='0.2'/%3E%3Cline x1='262' y1='115' x2='262' y2='135' stroke='%230284c7' stroke-width='1.5' opacity='0.2'/%3E%3C!-- Medical cross small --%3E%3Crect x='25' y='80' width='8' height='24' rx='2' fill='%230284c7' opacity='0.16'/%3E%3Crect x='18' y='87' width='22' height='8' rx='2' fill='%230284c7' opacity='0.16'/%3E%3C!-- Document lines --%3E%3Crect x='15' y='150' width='80' height='55' rx='4' fill='none' stroke='%230284c7' stroke-width='1.5' opacity='0.16'/%3E%3Cline x1='22' y1='165' x2='88' y2='165' stroke='%230284c7' stroke-width='1' opacity='0.14'/%3E%3Cline x1='22' y1='178' x2='88' y2='178' stroke='%230284c7' stroke-width='1' opacity='0.14'/%3E%3Cline x1='22' y1='191' x2='70' y2='191' stroke='%230284c7' stroke-width='1' opacity='0.14'/%3E%3C/svg%3E")`,

    // Research Support: microscope, DNA helix, lab flask, research notes
    research: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='220' viewBox='0 0 300 220'%3E%3Crect width='300' height='220' fill='%23f0f9ff'/%3E%3C!-- Microscope outline --%3E%3Cline x1='80' y1='170' x2='120' y2='170' stroke='%230284c7' stroke-width='2' opacity='0.22'/%3E%3Cline x1='100' y1='170' x2='100' y2='130' stroke='%230284c7' stroke-width='2' opacity='0.22'/%3E%3Crect x='85' y='120' width='30' height='20' rx='3' fill='none' stroke='%230284c7' stroke-width='1.5' opacity='0.22'/%3E%3Crect x='91' y='95' width='18' height='30' rx='2' fill='none' stroke='%230284c7' stroke-width='1.5' opacity='0.22'/%3E%3Cellipse cx='100' cy='93' rx='14' ry='6' fill='none' stroke='%230284c7' stroke-width='1.5' opacity='0.22'/%3E%3Cline x1='100' y1='87' x2='100' y2='60' stroke='%230284c7' stroke-width='1.5' opacity='0.22'/%3E%3Ccircle cx='100' cy='55' r='8' fill='none' stroke='%230284c7' stroke-width='1.5' opacity='0.22'/%3E%3Cline x1='80' y1='130' x2='70' y2='170' stroke='%230284c7' stroke-width='1.5' opacity='0.2'/%3E%3C!-- DNA helix --%3E%3Cpath d='M185 30 C195 45 215 55 225 70 C235 85 215 95 205 110 C195 125 215 135 225 150 C235 165 215 175 205 190' fill='none' stroke='%230284c7' stroke-width='1.5' opacity='0.22'/%3E%3Cpath d='M225 30 C215 45 195 55 185 70 C175 85 195 95 205 110 C215 125 195 135 185 150 C175 165 195 175 205 190' fill='none' stroke='%230ea5e9' stroke-width='1.5' opacity='0.2'/%3E%3Cline x1='188' y1='48' x2='222' y2='48' stroke='%230284c7' stroke-width='1' opacity='0.16'/%3E%3Cline x1='183' y1='70' x2='222' y2='70' stroke='%230284c7' stroke-width='1' opacity='0.16'/%3E%3Cline x1='188' y1='92' x2='222' y2='92' stroke='%230284c7' stroke-width='1' opacity='0.16'/%3E%3Cline x1='183' y1='130' x2='222' y2='130' stroke='%230284c7' stroke-width='1' opacity='0.16'/%3E%3Cline x1='188' y1='152' x2='222' y2='152' stroke='%230284c7' stroke-width='1' opacity='0.16'/%3E%3Cline x1='183' y1='170' x2='222' y2='170' stroke='%230284c7' stroke-width='1' opacity='0.16'/%3E%3C!-- Flask --%3E%3Cpath d='M260 40 L260 90 L240 130 L280 130 L260 90' fill='none' stroke='%230284c7' stroke-width='1.5' opacity='0.2'/%3E%3Cline x1='252' y1='40' x2='268' y2='40' stroke='%230284c7' stroke-width='1.5' opacity='0.2'/%3E%3Cellipse cx='260' cy='118' rx='16' ry='6' fill='%230284c7' opacity='0.08'/%3E%3C!-- Medical cross small --%3E%3Crect x='22' y='50' width='8' height='24' rx='2' fill='%230284c7' opacity='0.16'/%3E%3Crect x='15' y='57' width='22' height='8' rx='2' fill='%230284c7' opacity='0.16'/%3E%3C/svg%3E")`,

    // Project Management: team/people icons, checklist, healthcare team collaboration
    project: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='220' viewBox='0 0 300 220'%3E%3Crect width='300' height='220' fill='%23f0f9ff'/%3E%3C!-- People silhouettes (team) --%3E%3Ccircle cx='60' cy='55' r='14' fill='none' stroke='%230284c7' stroke-width='1.5' opacity='0.22'/%3E%3Cpath d='M38 100 Q38 75 60 75 Q82 75 82 100' fill='none' stroke='%230284c7' stroke-width='1.5' opacity='0.22'/%3E%3Ccircle cx='120' cy='55' r='14' fill='none' stroke='%230284c7' stroke-width='1.5' opacity='0.22'/%3E%3Cpath d='M98 100 Q98 75 120 75 Q142 75 142 100' fill='none' stroke='%230284c7' stroke-width='1.5' opacity='0.22'/%3E%3Ccircle cx='180' cy='55' r='14' fill='none' stroke='%230284c7' stroke-width='1.5' opacity='0.22'/%3E%3Cpath d='M158 100 Q158 75 180 75 Q202 75 202 100' fill='none' stroke='%230284c7' stroke-width='1.5' opacity='0.22'/%3E%3C!-- Connection lines between people --%3E%3Cline x1='82' y1='60' x2='106' y2='60' stroke='%230284c7' stroke-width='1' opacity='0.16' stroke-dasharray='4,3'/%3E%3Cline x1='142' y1='60' x2='166' y2='60' stroke='%230284c7' stroke-width='1' opacity='0.16' stroke-dasharray='4,3'/%3E%3C!-- Checklist / clipboard --%3E%3Crect x='220' y='35' width='65' height='90' rx='4' fill='none' stroke='%230284c7' stroke-width='1.5' opacity='0.2'/%3E%3Crect x='230' y='28' width='45' height='14' rx='4' fill='none' stroke='%230284c7' stroke-width='1.5' opacity='0.2'/%3E%3Cpolyline points='228,57 234,63 245,52' fill='none' stroke='%230ea5e9' stroke-width='1.5' opacity='0.28'/%3E%3Cline x1='250' y1='57' x2='278' y2='57' stroke='%230284c7' stroke-width='1' opacity='0.18'/%3E%3Cpolyline points='228,75 234,81 245,70' fill='none' stroke='%230ea5e9' stroke-width='1.5' opacity='0.28'/%3E%3Cline x1='250' y1='75' x2='278' y2='75' stroke='%230284c7' stroke-width='1' opacity='0.18'/%3E%3Cpolyline points='228,93 234,99 245,88' fill='none' stroke='%230ea5e9' stroke-width='1.5' opacity='0.28'/%3E%3Cline x1='250' y1='93' x2='278' y2='93' stroke='%230284c7' stroke-width='1' opacity='0.18'/%3E%3Cline x1='228' y1='110' x2='260' y2='110' stroke='%230284c7' stroke-width='1' opacity='0.14'/%3E%3C!-- Gantt bars --%3E%3Crect x='20' y='125' width='260' height='12' rx='2' fill='none' stroke='%230284c7' stroke-width='1' opacity='0.12'/%3E%3Crect x='20' y='125' width='120' height='12' rx='2' fill='%230284c7' opacity='0.1'/%3E%3Crect x='20' y='143' width='260' height='12' rx='2' fill='none' stroke='%230284c7' stroke-width='1' opacity='0.12'/%3E%3Crect x='20' y='143' width='190' height='12' rx='2' fill='%230284c7' opacity='0.1'/%3E%3Crect x='20' y='161' width='260' height='12' rx='2' fill='none' stroke='%230284c7' stroke-width='1' opacity='0.12'/%3E%3Crect x='20' y='161' width='80' height='12' rx='2' fill='%230284c7' opacity='0.1'/%3E%3Crect x='20' y='179' width='260' height='12' rx='2' fill='none' stroke='%230284c7' stroke-width='1' opacity='0.12'/%3E%3Crect x='20' y='179' width='155' height='12' rx='2' fill='%230284c7' opacity='0.1'/%3E%3C/svg%3E")`,

    // Monitoring & Evaluation: community health worker, map pins, trend chart
    monitoring: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='220' viewBox='0 0 300 220'%3E%3Crect width='300' height='220' fill='%23f0f9ff'/%3E%3C!-- Map / geographic outline (Africa-ish shape) --%3E%3Cellipse cx='80' cy='110' rx='50' ry='75' fill='none' stroke='%230284c7' stroke-width='1.5' opacity='0.15'/%3E%3C!-- Map pins --%3E%3Ccircle cx='65' cy='75' r='6' fill='none' stroke='%230ea5e9' stroke-width='1.5' opacity='0.28'/%3E%3Cline x1='65' y1='81' x2='65' y2='95' stroke='%230ea5e9' stroke-width='1.5' opacity='0.28'/%3E%3Ccircle cx='95' cy='100' r='6' fill='none' stroke='%230ea5e9' stroke-width='1.5' opacity='0.28'/%3E%3Cline x1='95' y1='106' x2='95' y2='120' stroke='%230ea5e9' stroke-width='1.5' opacity='0.28'/%3E%3Ccircle cx='75' cy='135' r='6' fill='none' stroke='%230ea5e9' stroke-width='1.5' opacity='0.28'/%3E%3Cline x1='75' y1='141' x2='75' y2='155' stroke='%230ea5e9' stroke-width='1.5' opacity='0.28'/%3E%3C!-- Community health worker (person with bag / kit) --%3E%3Ccircle cx='210' cy='60' r='16' fill='none' stroke='%230284c7' stroke-width='1.5' opacity='0.22'/%3E%3Cpath d='M190 115 Q190 85 210 85 Q230 85 230 115' fill='none' stroke='%230284c7' stroke-width='1.5' opacity='0.22'/%3E%3Cline x1='190' y1='100' x2='175' y2='120' stroke='%230284c7' stroke-width='1.5' opacity='0.2'/%3E%3Crect x='163' y='118' width='18' height='14' rx='3' fill='none' stroke='%230284c7' stroke-width='1.5' opacity='0.2'/%3E%3Crect x='166' y='120' width='5' height='10' rx='1' fill='%230284c7' opacity='0.14'/%3E%3Crect x='164' y='124' width='11' height='4' rx='1' fill='%230284c7' opacity='0.14'/%3E%3C!-- Upward trend chart --%3E%3Cpolyline points='155,190 175,175 195,178 215,160 235,163 255,145 275,148' fill='none' stroke='%230284c7' stroke-width='2' opacity='0.22'/%3E%3Ccircle cx='155' cy='190' r='3' fill='%230284c7' opacity='0.26'/%3E%3Ccircle cx='195' cy='178' r='3' fill='%230284c7' opacity='0.26'/%3E%3Ccircle cx='235' cy='163' r='3' fill='%230284c7' opacity='0.26'/%3E%3Ccircle cx='275' cy='148' r='3' fill='%230284c7' opacity='0.26'/%3E%3Cline x1='148' y1='195' x2='282' y2='195' stroke='%230284c7' stroke-width='1' opacity='0.18'/%3E%3C/svg%3E")`
  };

  // EMR / Digital health background: tablet with medical interface, healthcare professionals
  const emrBackground = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='280' viewBox='0 0 400 280'%3E%3Crect width='400' height='280' fill='%23f0f9ff'/%3E%3C!-- Tablet device --%3E%3Crect x='30' y='30' width='130' height='180' rx='12' fill='none' stroke='%230284c7' stroke-width='2' opacity='0.22'/%3E%3Crect x='38' y='45' width='114' height='140' rx='3' fill='%230284c7' opacity='0.06'/%3E%3Ccircle cx='95' cy='198' r='6' fill='none' stroke='%230284c7' stroke-width='1.5' opacity='0.2'/%3E%3C!-- EMR interface on tablet --%3E%3Cline x1='42' y1='60' x2='148' y2='60' stroke='%230284c7' stroke-width='1' opacity='0.18'/%3E%3Crect x='42' y='65' width='50' height='8' rx='2' fill='%230284c7' opacity='0.1'/%3E%3Cline x1='42' y1='80' x2='148' y2='80' stroke='%230284c7' stroke-width='1' opacity='0.14'/%3E%3Cline x1='42' y1='92' x2='148' y2='92' stroke='%230284c7' stroke-width='1' opacity='0.14'/%3E%3Cline x1='42' y1='104' x2='130' y2='104' stroke='%230284c7' stroke-width='1' opacity='0.14'/%3E%3C!-- Mini chart on tablet --%3E%3Cpolyline points='45,150 60,135 75,142 90,120 105,130 120,115 135,122' fill='none' stroke='%230ea5e9' stroke-width='1.5' opacity='0.25'/%3E%3Cline x1='42' y1='162' x2='148' y2='162' stroke='%230284c7' stroke-width='1' opacity='0.14'/%3E%3C!-- Healthcare professional (doctor) silhouette --%3E%3Ccircle cx='230' cy='75' r='22' fill='none' stroke='%230284c7' stroke-width='1.5' opacity='0.2'/%3E%3Cpath d='M200 145 Q200 105 230 105 Q260 105 260 145' fill='none' stroke='%230284c7' stroke-width='1.5' opacity='0.2'/%3E%3C!-- Stethoscope on doctor --%3E%3Cpath d='M220 125 Q210 135 208 148 Q208 158 215 158 Q222 158 222 148' fill='none' stroke='%230284c7' stroke-width='1.5' opacity='0.2'/%3E%3Ccircle cx='222' cy='152' r='5' fill='none' stroke='%230284c7' stroke-width='1.5' opacity='0.2'/%3E%3C!-- Ambulance outline --%3E%3Crect x='290' y='130' width='90' height='55' rx='6' fill='none' stroke='%230284c7' stroke-width='2' opacity='0.2'/%3E%3Crect x='355' y='120' width='25' height='30' rx='4' fill='none' stroke='%230284c7' stroke-width='1.5' opacity='0.2'/%3E%3Ccircle cx='305' cy='188' r='10' fill='none' stroke='%230284c7' stroke-width='2' opacity='0.2'/%3E%3Ccircle cx='365' cy='188' r='10' fill='none' stroke='%230284c7' stroke-width='2' opacity='0.2'/%3E%3Crect x='310' y='143' width='8' height='22' rx='2' fill='%230284c7' opacity='0.16'/%3E%3Crect x='303' y='150' width='22' height='8' rx='2' fill='%230284c7' opacity='0.16'/%3E%3C!-- Medical cross small top-right --%3E%3Crect x='348' y='50' width='10' height='30' rx='2' fill='%230284c7' opacity='0.16'/%3E%3Crect x='340' y='58' width='26' height='10' rx='2' fill='%230284c7' opacity='0.16'/%3E%3C!-- Vaccine / syringe outline --%3E%3Cline x1='190' y1='190' x2='260' y2='190' stroke='%230284c7' stroke-width='1.5' opacity='0.18'/%3E%3Crect x='200' y='183' width='50' height='14' rx='4' fill='none' stroke='%230284c7' stroke-width='1.5' opacity='0.2'/%3E%3Cline x1='250' y1='190' x2='268' y2='190' stroke='%230284c7' stroke-width='1.5' opacity='0.18'/%3E%3Cline x1='195' y1='186' x2='195' y2='194' stroke='%230284c7' stroke-width='1.5' opacity='0.18'/%3E%3Cline x1='190' y1='190' x2='200' y2='190' stroke='%230284c7' stroke-width='1.5' opacity='0.18'/%3E%3C/svg%3E")`;

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
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='900' height='300' viewBox='0 0 900 300'%3E%3Crect width='900' height='300' fill='%23ffffff'/%3E%3C!-- Doctor/clinician silhouette left --%3E%3Ccircle cx='60' cy='70' r='22' fill='none' stroke='%230284c7' stroke-width='2' opacity='0.18'/%3E%3Cpath d='M28 155 Q28 100 60 100 Q92 100 92 155' fill='none' stroke='%230284c7' stroke-width='2' opacity='0.18'/%3E%3Cpath d='M48 128 Q38 140 36 158 Q36 172 46 172 Q56 172 56 158' fill='none' stroke='%230284c7' stroke-width='1.5' opacity='0.18'/%3E%3Ccircle cx='56' cy='165' r='6' fill='none' stroke='%230284c7' stroke-width='1.5' opacity='0.18'/%3E%3C!-- Nurse silhouette --%3E%3Ccircle cx='160' cy='75' r='20' fill='none' stroke='%230284c7' stroke-width='2' opacity='0.16'/%3E%3Cpath d='M132 155 Q132 103 160 103 Q188 103 188 155' fill='none' stroke='%230284c7' stroke-width='2' opacity='0.16'/%3E%3Crect x='150' y='60' width='6' height='18' rx='2' fill='%230284c7' opacity='0.14'/%3E%3Crect x='144' y='66' width='18' height='6' rx='2' fill='%230284c7' opacity='0.14'/%3E%3C!-- Field health worker with clipboard --%3E%3Ccircle cx='260' cy='72' r='20' fill='none' stroke='%230284c7' stroke-width='2' opacity='0.16'/%3E%3Cpath d='M232 150 Q232 100 260 100 Q288 100 288 150' fill='none' stroke='%230284c7' stroke-width='2' opacity='0.16'/%3E%3Crect x='290' y='105' width='22' height='30' rx='3' fill='none' stroke='%230284c7' stroke-width='1.5' opacity='0.18'/%3E%3Crect x='294' y='100' width='14' height='8' rx='2' fill='none' stroke='%230284c7' stroke-width='1.5' opacity='0.18'/%3E%3Cline x1='294' y1='115' x2='308' y2='115' stroke='%230284c7' stroke-width='1' opacity='0.14'/%3E%3Cline x1='294' y1='122' x2='308' y2='122' stroke='%230284c7' stroke-width='1' opacity='0.14'/%3E%3C!-- Ambulance --%3E%3Crect x='370' y='120' width='110' height='65' rx='7' fill='none' stroke='%230284c7' stroke-width='2' opacity='0.18'/%3E%3Crect x='445' y='108' width='35' height='38' rx='5' fill='none' stroke='%230284c7' stroke-width='1.5' opacity='0.18'/%3E%3Ccircle cx='390' cy='188' r='12' fill='none' stroke='%230284c7' stroke-width='2' opacity='0.18'/%3E%3Ccircle cx='460' cy='188' r='12' fill='none' stroke='%230284c7' stroke-width='2' opacity='0.18'/%3E%3Crect x='393' y='143' width='10' height='28' rx='2' fill='%230284c7' opacity='0.15'/%3E%3Crect x='385' y='151' width='26' height='10' rx='2' fill='%230284c7' opacity='0.15'/%3E%3C!-- Vaccine / syringe --%3E%3Crect x='560' y='90' width='60' height='16' rx='5' fill='none' stroke='%230284c7' stroke-width='1.5' opacity='0.18'/%3E%3Cline x1='620' y1='98' x2='640' y2='98' stroke='%230284c7' stroke-width='1.5' opacity='0.18'/%3E%3Cline x1='555' y1='94' x2='555' y2='102' stroke='%230284c7' stroke-width='1.5' opacity='0.18'/%3E%3Cline x1='548' y1='98' x2='560' y2='98' stroke='%230284c7' stroke-width='1.5' opacity='0.18'/%3E%3Cline x1='572' y1='87' x2='572' y2='80' stroke='%230284c7' stroke-width='1' opacity='0.14'/%3E%3Cline x1='584' y1='87' x2='584' y2='80' stroke='%230284c7' stroke-width='1' opacity='0.14'/%3E%3Cline x1='596' y1='87' x2='596' y2='80' stroke='%230284c7' stroke-width='1' opacity='0.14'/%3E%3C!-- ECG / vital signs line --%3E%3Cpolyline points='530,200 560,200 575,165 585,235 595,200 650,200 660,180 670,220 680,200 720,200' fill='none' stroke='%230284c7' stroke-width='2' opacity='0.2'/%3E%3C!-- Medical cross large right --%3E%3Crect x='790' y='80' width='16' height='50' rx='4' fill='%230284c7' opacity='0.15'/%3E%3Crect x='773' y='97' width='50' height='16' rx='4' fill='%230284c7' opacity='0.15'/%3E%3C!-- DNA right side --%3E%3Cpath d='M855 40 C865 55 885 65 895 80 C905 95 885 105 875 120 C865 135 885 145 895 160 C905 175 885 185 875 200' fill='none' stroke='%230284c7' stroke-width='1.5' opacity='0.18'/%3E%3Cpath d='M895 40 C885 55 865 65 855 80 C845 95 865 105 875 120 C885 135 865 145 855 160 C845 175 865 185 875 200' fill='none' stroke='%230ea5e9' stroke-width='1.5' opacity='0.16'/%3E%3Cline x1='858' y1='58' x2='892' y2='58' stroke='%230284c7' stroke-width='1' opacity='0.14'/%3E%3Cline x1='853' y1='80' x2='893' y2='80' stroke='%230284c7' stroke-width='1' opacity='0.14'/%3E%3Cline x1='858' y1='102' x2='893' y2='102' stroke='%230284c7' stroke-width='1' opacity='0.14'/%3E%3Cline x1='853' y1='140' x2='893' y2='140' stroke='%230284c7' stroke-width='1' opacity='0.14'/%3E%3Cline x1='858' y1='162' x2='893' y2='162' stroke='%230284c7' stroke-width='1' opacity='0.14'/%3E%3C/svg%3E")`,
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
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
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='900' height='500' viewBox='0 0 900 500'%3E%3Crect width='900' height='500' fill='%23f8fafc'/%3E%3C!-- Large medical cross left --%3E%3Crect x='40' y='150' width='20' height='60' rx='4' fill='%230284c7' opacity='0.1'/%3E%3Crect x='20' y='170' width='60' height='20' rx='4' fill='%230284c7' opacity='0.1'/%3E%3C!-- ECG / heartbeat across full width --%3E%3Cpolyline points='100,350 160,350 185,290 200,410 215,350 350,350 365,320 380,380 395,350 520,350' fill='none' stroke='%230284c7' stroke-width='2.5' opacity='0.12'/%3E%3C!-- Healthcare team silhouettes centre --%3E%3Ccircle cx='420' cy='130' r='28' fill='none' stroke='%230284c7' stroke-width='2' opacity='0.1'/%3E%3Cpath d='M382 220 Q382 165 420 165 Q458 165 458 220' fill='none' stroke='%230284c7' stroke-width='2' opacity='0.1'/%3E%3Ccircle cx='490' cy='135' r='24' fill='none' stroke='%230284c7' stroke-width='1.5' opacity='0.1'/%3E%3Cpath d='M458 210 Q458 162 490 162 Q522 162 522 210' fill='none' stroke='%230284c7' stroke-width='1.5' opacity='0.1'/%3E%3C!-- Stethoscope outline right --%3E%3Ccircle cx='760' cy='200' r='30' fill='none' stroke='%230284c7' stroke-width='2' opacity='0.1'/%3E%3Cpath d='M760 170 Q752 145 738 148 Q728 151 730 162' fill='none' stroke='%230284c7' stroke-width='2' opacity='0.1'/%3E%3Ccircle cx='730' cy='165' r='7' fill='none' stroke='%230284c7' stroke-width='2' opacity='0.1'/%3E%3C!-- Globe / world map outlines --%3E%3Ccircle cx='820' cy='380' rx='60' ry='60' r='60' fill='none' stroke='%230284c7' stroke-width='1.5' opacity='0.08'/%3E%3Cellipse cx='820' cy='380' rx='30' ry='60' fill='none' stroke='%230284c7' stroke-width='1' opacity='0.08'/%3E%3Cline x1='760' y1='380' x2='880' y2='380' stroke='%230284c7' stroke-width='1' opacity='0.08'/%3E%3C!-- Vaccine syringe top right --%3E%3Crect x='800' y='60' width='75' height='18' rx='6' fill='none' stroke='%230284c7' stroke-width='1.5' opacity='0.1'/%3E%3Cline x1='875' y1='69' x2='898' y2='69' stroke='%230284c7' stroke-width='1.5' opacity='0.1'/%3E%3Cline x1='793' y1='65' x2='793' y2='73' stroke='%230284c7' stroke-width='1.5' opacity='0.1'/%3E%3Cline x1='786' y1='69' x2='800' y2='69' stroke='%230284c7' stroke-width='1.5' opacity='0.1'/%3E%3C/svg%3E")`,
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
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='900' height='300' viewBox='0 0 900 300'%3E%3Crect width='900' height='300' fill='%23ffffff'/%3E%3C!-- Doctor consulting patient --%3E%3Ccircle cx='70' cy='80' r='22' fill='none' stroke='%230284c7' stroke-width='2' opacity='0.2'/%3E%3Cpath d='M40 165 Q40 110 70 110 Q100 110 100 165' fill='none' stroke='%230284c7' stroke-width='2' opacity='0.2'/%3E%3Cpath d='M58 132 Q48 144 46 162 Q46 175 56 175 Q66 175 66 162' fill='none' stroke='%230284c7' stroke-width='1.5' opacity='0.18'/%3E%3Ccircle cx='66' cy='168' r='6' fill='none' stroke='%230284c7' stroke-width='1.5' opacity='0.18'/%3E%3C!-- Patient (seated) --%3E%3Ccircle cx='180' cy='85' r='18' fill='none' stroke='%230284c7' stroke-width='1.5' opacity='0.18'/%3E%3Cpath d='M155 155 Q155 110 180 110 Q205 110 205 155' fill='none' stroke='%230284c7' stroke-width='1.5' opacity='0.18'/%3E%3Cline x1='155' y1='140' x2='130' y2='160' stroke='%230284c7' stroke-width='1.5' opacity='0.16'/%3E%3C!-- Vaccine administration syringe (large) --%3E%3Crect x='280' y='105' width='90' height='22' rx='8' fill='none' stroke='%230284c7' stroke-width='2' opacity='0.2'/%3E%3Cline x1='370' y1='116' x2='398' y2='116' stroke='%230284c7' stroke-width='2' opacity='0.2'/%3E%3Cline x1='273' y1='110' x2='273' y2='122' stroke='%230284c7' stroke-width='2' opacity='0.2'/%3E%3Cline x1='265' y1='116' x2='280' y2='116' stroke='%230284c7' stroke-width='2' opacity='0.2'/%3E%3Cline x1='300' y1='103' x2='300' y2='93' stroke='%230284c7' stroke-width='1.5' opacity='0.16'/%3E%3Cline x1='318' y1='103' x2='318' y2='93' stroke='%230284c7' stroke-width='1.5' opacity='0.16'/%3E%3Cline x1='336' y1='103' x2='336' y2='93' stroke='%230284c7' stroke-width='1.5' opacity='0.16'/%3E%3Cline x1='354' y1='103' x2='354' y2='93' stroke='%230284c7' stroke-width='1.5' opacity='0.16'/%3E%3C!-- Clinical trial phases diagram --%3E%3Ccircle cx='480' cy='100' r='28' fill='none' stroke='%230284c7' stroke-width='2' opacity='0.18'/%3E%3Ctext x='471' y='105' font-family='sans-serif' font-size='14' font-weight='bold' fill='%230284c7' opacity='0.22'%3EI%3C/text%3E%3Cline x1='508' y1='100' x2='530' y2='100' stroke='%230284c7' stroke-width='1.5' opacity='0.16'/%3E%3Ccircle cx='558' cy='100' r='28' fill='none' stroke='%230284c7' stroke-width='2' opacity='0.18'/%3E%3Ctext x='545' y='105' font-family='sans-serif' font-size='14' font-weight='bold' fill='%230284c7' opacity='0.22'%3EII%3C/text%3E%3Cline x1='586' y1='100' x2='608' y2='100' stroke='%230284c7' stroke-width='1.5' opacity='0.16'/%3E%3Ccircle cx='636' cy='100' r='28' fill='none' stroke='%230284c7' stroke-width='2' opacity='0.18'/%3E%3Ctext x='621' y='105' font-family='sans-serif' font-size='14' font-weight='bold' fill='%230284c7' opacity='0.22'%3EIII%3C/text%3E%3C!-- Medical cross --%3E%3Crect x='726' y='70' width='14' height='42' rx='3' fill='%230284c7' opacity='0.16'/%3E%3Crect x='710' y='84' width='46' height='14' rx='3' fill='%230284c7' opacity='0.16'/%3E%3C!-- Lab flask / vial --%3E%3Cpath d='M810 55 L810 115 L786 160 L834 160 L810 115' fill='none' stroke='%230284c7' stroke-width='2' opacity='0.18'/%3E%3Cline x1='800' y1='55' x2='820' y2='55' stroke='%230284c7' stroke-width='2' opacity='0.18'/%3E%3Cellipse cx='810' cy='148' rx='20' ry='7' fill='%230284c7' opacity='0.08'/%3E%3C!-- ECG bottom --%3E%3Cpolyline points='20,240 80,240 100,210 112,270 124,240 200,240 215,215 225,265 235,240 320,240' fill='none' stroke='%230284c7' stroke-width='1.5' opacity='0.16'/%3E%3C/svg%3E")`,
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
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
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='900' height='400' viewBox='0 0 900 400'%3E%3Crect width='900' height='400' fill='%23f0f9ff'/%3E%3C!-- Tablet device left --%3E%3Crect x='40' y='50' width='110' height='155' rx='10' fill='none' stroke='%230284c7' stroke-width='2' opacity='0.2'/%3E%3Crect x='50' y='65' width='90' height='110' rx='3' fill='%230284c7' opacity='0.05'/%3E%3Ccircle cx='95' cy='192' r='6' fill='none' stroke='%230284c7' stroke-width='1.5' opacity='0.18'/%3E%3C!-- EMR chart on tablet --%3E%3Cpolyline points='54,120 68,105 80,112 92,95 104,103 116,88 130,96' fill='none' stroke='%230ea5e9' stroke-width='1.5' opacity='0.22'/%3E%3Cline x1='52' y1='80' x2='138' y2='80' stroke='%230284c7' stroke-width='1' opacity='0.15'/%3E%3Cline x1='52' y1='150' x2='138' y2='150' stroke='%230284c7' stroke-width='1' opacity='0.12'/%3E%3C!-- Laptop / computer screen --%3E%3Crect x='200' y='80' width='160' height='110' rx='6' fill='none' stroke='%230284c7' stroke-width='2' opacity='0.2'/%3E%3Crect x='208' y='88' width='144' height='95' rx='3' fill='%230284c7' opacity='0.05'/%3E%3Cline x1='190' y1='192' x2='372' y2='192' stroke='%230284c7' stroke-width='8' stroke-linecap='round' opacity='0.12'/%3E%3C!-- Dashboard on laptop --%3E%3Crect x='213' y='93' width='60' height='38' rx='3' fill='none' stroke='%230284c7' stroke-width='1' opacity='0.18'/%3E%3Crect x='279' y='93' width='68' height='38' rx='3' fill='none' stroke='%230284c7' stroke-width='1' opacity='0.18'/%3E%3Cpolyline points='215,150 230,140 245,144 260,133 275,138 290,127 305,131 320,120 335,125 345,115' fill='none' stroke='%230ea5e9' stroke-width='1.5' opacity='0.22'/%3E%3Cline x1='210' y1='168' x2='348' y2='168' stroke='%230284c7' stroke-width='1' opacity='0.12'/%3E%3C!-- Healthcare professional with tablet --%3E%3Ccircle cx='470' cy='85' r='26' fill='none' stroke='%230284c7' stroke-width='2' opacity='0.18'/%3E%3Cpath d='M436 165 Q436 118 470 118 Q504 118 504 165' fill='none' stroke='%230284c7' stroke-width='2' opacity='0.18'/%3E%3Crect x='508' y='130' width='35' height='48' rx='5' fill='none' stroke='%230284c7' stroke-width='1.5' opacity='0.2'/%3E%3Cline x1='513' y1='142' x2='538' y2='142' stroke='%230284c7' stroke-width='1' opacity='0.14'/%3E%3Cline x1='513' y1='152' x2='538' y2='152' stroke='%230284c7' stroke-width='1' opacity='0.14'/%3E%3Cline x1='513' y1='162' x2='530' y2='162' stroke='%230284c7' stroke-width='1' opacity='0.14'/%3E%3C!-- Ambulance right side --%3E%3Crect x='620' y='140' width='120' height='70' rx='8' fill='none' stroke='%230284c7' stroke-width='2' opacity='0.2'/%3E%3Crect x='700' y='125' width='40' height='40' rx='5' fill='none' stroke='%230284c7' stroke-width='1.5' opacity='0.18'/%3E%3Ccircle cx='640' cy='214' r='14' fill='none' stroke='%230284c7' stroke-width='2' opacity='0.2'/%3E%3Ccircle cx='720' cy='214' r='14' fill='none' stroke='%230284c7' stroke-width='2' opacity='0.2'/%3E%3Crect x='643' y='162' width='12' height='32' rx='2' fill='%230284c7' opacity='0.16'/%3E%3Crect x='635' y='170' width='28' height='12' rx='2' fill='%230284c7' opacity='0.16'/%3E%3C!-- Medical cross top right --%3E%3Crect x='808' y='55' width='16' height='50' rx='4' fill='%230284c7' opacity='0.16'/%3E%3Crect x='791' y='72' width='50' height='16' rx='4' fill='%230284c7' opacity='0.16'/%3E%3C!-- Stethoscope right --%3E%3Ccircle cx='860' cy='270' r='25' fill='none' stroke='%230284c7' stroke-width='2' opacity='0.18'/%3E%3Cpath d='M860 245 Q854 224 842 226 Q834 228 835 238' fill='none' stroke='%230284c7' stroke-width='2' opacity='0.18'/%3E%3Ccircle cx='835' cy='240' r='6' fill='none' stroke='%230284c7' stroke-width='2' opacity='0.18'/%3E%3C/svg%3E")`,
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
