export const siteUrl = 'https://bluetick-health.co.za'
export const siteName = 'Bluetick Health'
export const defaultAuthor = 'Bluetick Health Analytics Team'

export const navigationLinks = [
  { label: 'Home', href: '/' },
  { label: 'Services', href: '/#services' },
  { label: 'Projects', href: '/#projects' },
  { label: 'Blog', href: '/blog/' },
  { label: 'News', href: '/news/' },
  { label: 'Products', href: '/products/' },
  { label: 'Resources', href: '/resources/' },
  { label: 'FAQ', href: '/faq/' },
  { label: 'Vacancies', href: '/vacancies/' },
  { label: 'Contact', href: '/#contact' },
]

export const blogPosts = [
  {
    slug: 'survival-analysis-clinical-research',
    title: 'Survival Analysis in Clinical Research: From Kaplan-Meier Curves to Adjusted Hazard Ratios',
    datePublished: '2026-07-15',
    author: defaultAuthor,
    keywords: ['survival analysis', 'clinical research', 'Kaplan-Meier', 'Cox regression', 'biostatistics'],
    excerpt:
      'A practical guide to survival analysis in clinical research, including censoring, Kaplan-Meier estimation, Cox proportional hazards models, and reproducible R and Stata workflows.',
    summary:
      'Learn how survival analysis supports clinical research decisions with Kaplan-Meier curves, hazard ratios, and transparent reporting strategies for investigators and sponsors.',
    codeLanguage: 'R',
    code: `library(survival)\nlibrary(survminer)\n\ntrial_data <- transform(\n  trial_data,\n  treatment = factor(treatment, levels = c(0, 1), labels = c("Standard care", "Intervention"))\n)\n\nkm_fit <- survfit(Surv(time_months, event) ~ treatment, data = trial_data)\nggsurvplot(\n  km_fit,\n  data = trial_data,\n  risk.table = TRUE,\n  pval = TRUE,\n  conf.int = TRUE,\n  xlab = "Follow-up time (months)",\n  ylab = "Survival probability"\n)\n\ncox_fit <- coxph(\n  Surv(time_months, event) ~ treatment + age + hiv_status + baseline_cd4,\n  data = trial_data\n)\nsummary(cox_fit)\ncox.zph(cox_fit)`,
    codeOutput: `Kaplan-Meier output (summary)
Call: survfit(formula = Surv(time_months, event) ~ treatment, data = trial_data)

                        n events median 0.95LCL 0.95UCL
treatment=Standard care 80     42   12.5    10.2    14.8
treatment=Intervention  80     28   18.3    15.7    21.1

Graph:
Survival probability
1.0 |\\
0.8 | \\__ Intervention
0.6 |  \\__
0.4 |   \\___ Standard care
0.2 |
    +------------------------------> Follow-up months`,
    codeInterpretation:
      'The output shows better time-to-event performance in the intervention arm, with fewer events and a longer median survival time than standard care. The visual separation of curves suggests a clinically meaningful difference over follow-up. In applied settings, this points to intervention benefit, which should then be confirmed with adjusted hazard ratios and assumptions checks.',
    paragraphs: [
      'Survival analysis remains one of the most important methods in clinical research because it answers a question that simple averages cannot: how long does it take until an outcome occurs, and how does that timing differ between treatment groups? In trials, cohort studies, and registry analyses, participants are often followed for unequal lengths of time. Some experience the endpoint, while others are censored because the study ends or they are lost to follow-up. Survival methods are specifically designed for this reality, making them essential for oncology, infectious disease, cardiovascular studies, and implementation research.',
      'A strong analysis begins with Kaplan-Meier estimation. Kaplan-Meier curves show the probability of remaining event-free over time and allow investigators to compare treatment groups visually. In many public health and clinical datasets, this first look reveals early separation of curves, delayed treatment effects, or heavy censoring that may affect interpretation. Investigators should report numbers at risk, median survival when appropriate, and a log-rank test when comparing unadjusted groups. Good reporting improves transparency for protocol teams, ethics committees, and journal reviewers.',
      'Once the descriptive picture is clear, Cox proportional hazards regression is usually the next step. Cox models estimate hazard ratios while adjusting for confounders such as age, baseline disease severity, or site. In practice, model building should be guided by the clinical question and prespecified covariates rather than automated selection alone. Analysts should also test proportional hazards assumptions and consider stratified or time-varying approaches if the effect changes during follow-up. This is especially relevant in pragmatic trials, programmatic cohorts, and real-world evidence studies where intervention effects may evolve over time.',
      'For decision-makers, the value of survival analysis lies in interpretation, not only estimation. A hazard ratio becomes more useful when linked to absolute event probabilities, follow-up duration, and implications for patient care or programme management. Clear code, reproducible outputs, and carefully labelled tables make the findings easier to defend in clinical study reports and publications. When survival analysis is planned early and executed rigorously, it produces evidence that clinicians, funders, and policy partners can trust.'
    ],
  },
  {
    slug: 'regression-analysis-methods-health-data',
    title: 'Regression Analysis Methods for Health Data: Choosing the Right Model for the Right Question',
    datePublished: '2026-07-22',
    author: defaultAuthor,
    keywords: ['regression analysis', 'health data', 'logistic regression', 'Poisson regression', 'public health statistics'],
    excerpt:
      'A concise framework for selecting linear, logistic, Poisson, and mixed-effects regression models for health data, with code examples that support reproducible analysis.',
    summary:
      'Explore regression analysis methods for health data and learn when to use linear, logistic, count, and multilevel models in public health and clinical research.',
    codeLanguage: 'Stata',
    code: `use health_survey_panel.dta, clear\nencode facility_id, gen(facility)\n\nlogit uncontrolled_bp age i.sex c.bmi##c.bmi i.diabetes i.treatment_group, vce(robust)\nestimates store logit_model\n\npoisson outpatient_visits age i.sex i.insurance chronic_count, vce(robust)\nestimates store poisson_model\n\nmixed systolic_bp month##i.treatment_group age i.sex || facility: || patient_id:, reml\nestimates store mixed_model\n\nesttab logit_model poisson_model mixed_model using regression_summary.rtf, replace se star(* 0.05 ** 0.01)`,
    codeOutput: `Logistic regression output (uncontrolled BP)

Variable                Coef.    SE      z      p>|z|    OR (95% CI)
age                     0.031   0.011   2.82   0.005    1.03 (1.01, 1.05)
female                 -0.214   0.098  -2.18   0.029    0.81 (0.67, 0.97)
bmi                     0.042   0.017   2.47   0.014    1.04 (1.01, 1.08)
diabetes                0.395   0.124   3.19   0.001    1.48 (1.16, 1.88)
treatment_group        -0.287   0.103  -2.79   0.005    0.75 (0.61, 0.92)

Model fit:
N = 1,248 | Wald chi2(5) = 46.7 | Prob > chi2 = 0.0000`,
    codeInterpretation:
      'This model indicates that older age, higher BMI, and diabetes are associated with higher odds of uncontrolled blood pressure, while the treatment group has lower odds. Odds ratios below 1.0 indicate a protective relationship, and values above 1.0 indicate increased odds. For programme decisions, the output highlights modifiable risk areas and supports targeted treatment follow-up.',
    paragraphs: [
      'Regression analysis is the backbone of modern health data analysis because most real questions involve relationships rather than isolated summaries. Researchers want to understand how risk factors predict disease, how interventions affect outcomes, and how results differ after adjustment for age, sex, baseline severity, or site. The challenge is not whether to use regression, but which type of regression best matches the outcome and study design. Model choice affects interpretation, statistical validity, and ultimately the credibility of the evidence presented to journals, donors, and healthcare leaders.',
      'Linear regression works well for approximately continuous outcomes such as quality-of-life scores, haemoglobin level, or cost per patient. Logistic regression is appropriate when the endpoint is binary, such as retention in care, virological suppression, or presence of severe disease. For counts such as admissions or clinic visits, Poisson or negative binomial models are often more defensible than forcing a continuous assumption. Analysts should also think carefully about effect modification, nonlinear trends, and clustered data, especially in multi-site public health programmes where patients are nested within facilities or districts.',
      'Multilevel and mixed-effects models are particularly valuable for longitudinal and implementation datasets because they account for repeated measures and correlation within clusters. In practice, this means the analysis better reflects how care is delivered in real systems. Robust estimation, clear prespecification of confounders, and thoughtful diagnostics are equally important. Analysts should examine model fit, residuals, overdispersion, and influential observations before moving to interpretation. Regression tables become much more useful when they are paired with predicted probabilities, marginal effects, or adjusted mean differences that non-statistical audiences can understand quickly.',
      'The best regression analysis does more than generate p-values. It creates an analytic narrative that links the statistical model to the policy or clinical question. For consulting teams supporting ministries, NGOs, and investigators, the goal is to translate model output into operational guidance. That may mean showing how risk changes across subgroups, quantifying expected programme gains, or demonstrating where uncertainty remains. When the modelling strategy is aligned with the decision context, regression analysis becomes a practical tool for better health planning rather than a purely technical exercise.'
    ],
  },
  {
    slug: 'time-series-analysis-public-health-monitoring',
    title: 'Time Series Analysis for Public Health Monitoring: Turning Routine Data into Actionable Signals',
    datePublished: '2026-08-05',
    author: defaultAuthor,
    keywords: ['time series analysis', 'public health monitoring', 'ARIMA', 'forecasting', 'surveillance analytics'],
    excerpt:
      'See how time series analysis improves disease surveillance, service monitoring, and forecasting with segmented trend analysis, seasonality checks, and reproducible R code.',
    summary:
      'Use time series analysis for public health monitoring to detect trends, forecast service demand, and evaluate interruptions or policy changes with robust methods.',
    codeLanguage: 'R',
    code: `library(forecast)\nlibrary(tsibble)\nlibrary(feasts)\n\nmonthly_cases <- ts(surveillance$malaria_cases, start = c(2021, 1), frequency = 12)\nautoplot(monthly_cases)\n\ndecomp <- STL(monthly_cases, s.window = "periodic")\nautoplot(decomp)\n\narima_fit <- auto.arima(monthly_cases, seasonal = TRUE, stepwise = FALSE, approximation = FALSE)\nforecast_values <- forecast(arima_fit, h = 6)\nautoplot(forecast_values)\n\npolicy_model <- tslm(monthly_cases ~ trend + season + xreg(intervention_flag))\nsummary(policy_model)`,
    codeOutput: `ARIMA(1,1,1)(0,1,1)[12] model fit
AICc = 482.4

Decomposition:
- Trend: gradual decline after Q3 2024
- Seasonal: recurrent peaks in Jan-Mar and Oct-Nov
- Remainder: short spikes during outbreak months

Forecast (next 6 months):
Month +1: 238 (95% PI: 201, 276)
Month +2: 225 (95% PI: 187, 266)
Month +3: 214 (95% PI: 175, 256)

Graph:
Observed series + forecast fan with 95% prediction intervals`,
    codeInterpretation:
      'The decomposition separates long-term trend from seasonal behavior and random shocks, making surveillance patterns easier to interpret. Forecast intervals show expected case ranges rather than single-point certainty, which is important for planning stock, staffing, and response thresholds. Practically, teams can use the projected range to trigger early operational actions before peak months.',
    paragraphs: [
      'Routine public health data can become far more strategic when analysed as a time series rather than a collection of isolated monthly totals. Disease notifications, medicine stock levels, immunisation coverage, laboratory turnaround times, and mortality counts all contain temporal structure. Trends, seasonality, and sudden disruptions are exactly what programme managers need to detect early. Time series analysis helps transform those signals into evidence, allowing health systems to monitor performance and anticipate where operational pressure is likely to emerge next.',
      'A practical workflow starts with plotting data carefully and checking completeness. Public health analysts should ask whether apparent changes reflect true epidemiological shifts, reporting artefacts, or delayed capture from facilities. Once the series is credible, decomposition and autocorrelation checks can reveal stable seasonal effects or longer-term movement. This is especially valuable for malaria, respiratory disease, maternal health service use, or medicine consumption, where planning decisions depend on predictable cycles as well as unexpected shocks. Interrupted time series methods can also quantify the effect of new guidelines, service disruptions, or funding changes.',
      'Forecasting methods such as ARIMA are helpful when managers need short-term projections for staffing, supply planning, or outbreak readiness. However, the technical model matters less than disciplined interpretation. Forecasts should be paired with confidence intervals, assumptions about reporting stability, and operational thresholds that trigger action. In many real-world settings, a transparent model with well-communicated uncertainty is more useful than a highly complex approach that programme teams cannot explain to partners or donors.',
      'Time series analysis is also a strong bridge between analytics and decision support. Visualisations are intuitive, intervention points are easy to communicate, and outputs can feed directly into dashboards and review meetings. For consulting teams working with ministries, NGOs, and digital health platforms, these methods create a repeatable way to monitor systems over time. When analysts combine rigorous modelling with contextual knowledge about programmes, time series outputs become practical tools for surveillance, service improvement, and accountability.'
    ],
  },
  {
    slug: 'clinical-trial-design-and-statistics',
    title: 'Clinical Trial Design and Statistics: Building Analytic Rigor into Every Study Phase',
    datePublished: '2026-08-12',
    author: defaultAuthor,
    keywords: ['clinical trial design', 'biostatistics', 'sample size', 'randomization', 'statistical analysis plan'],
    excerpt:
      'A practical overview of clinical trial design and statistics covering endpoints, randomization, sample size, and the importance of a rigorous statistical analysis plan.',
    summary:
      'Strengthen clinical trial design and statistics with clear endpoints, defensible sample size assumptions, robust randomization, and analysis plans aligned to ICH E9.',
    codeLanguage: 'R',
    code: `library(blockrand)\nlibrary(pwr)\n\nblockrand(n = 160, num.levels = 2, block.sizes = c(4, 6), levels = c("Control", "Intervention"))\n\npwr.2p.test(\n  h = ES.h(p1 = 0.55, p2 = 0.70),\n  sig.level = 0.05,\n  power = 0.8,\n  alternative = "two.sided"\n)\n\nanalysis_population <- subset(trial_dataset, randomised == 1)\nanalysis_population$visit_window <- cut(analysis_population$days_post_randomisation,\n  breaks = c(-Inf, 14, 30, 90, Inf),\n  labels = c("Week 2", "Month 1", "Month 3", "Later")\n)`,
    codeOutput: `Power calculation output

Two-sample proportion test
n per group = 80
Power = 0.80
Alpha = 0.05
Assumed response rates: Control = 0.55, Intervention = 0.70

Randomization balance check:
Control: 80 participants
Intervention: 80 participants

Graph:
Allocation chart showing near-equal enrollment by arm across block sizes`,
    codeInterpretation:
      'The sample size output indicates the trial is powered to detect the planned difference in response rates with conventional error thresholds. Balanced randomization supports internal validity and helps avoid confounding by unequal arm size. In practice, this gives investigators confidence that observed between-arm differences are interpretable and not driven by design imbalance.',
    paragraphs: [
      'Strong clinical trials begin long before enrolment opens. The statistical foundations of a trial are established during protocol development, when the team defines the primary objective, target population, endpoint structure, and comparison strategy. A clear estimand mindset is valuable here because it forces investigators to specify exactly what treatment effect they want to estimate and under which intercurrent events. That discipline reduces ambiguity later when the trial faces missed visits, treatment switching, or incomplete outcome data.',
      'Sample size and power calculations should reflect the clinical context rather than generic conventions. Investigators need assumptions that can be justified to ethics committees, funders, and regulators: expected control event rate, effect size worth detecting, attrition, cluster effects when applicable, and the planned analysis method. Randomization also deserves early attention. Allocation concealment, blocking, and stratification can protect balance across sites or risk groups, especially in multi-centre public health and clinical studies. These choices influence both internal validity and the quality of downstream statistical analysis.',
      'The statistical analysis plan translates the protocol into executable decisions. It should define analysis populations, covariate adjustment, handling of missing data, subgroup analyses, multiplicity management, and the presentation of tables, listings, and figures. For trials with time-to-event or repeated outcomes, analysts should predefine methods that align with the endpoint and trial conduct. Interim analyses and data monitoring procedures must also be clearly specified to avoid bias or confusion. A disciplined SAP reduces avoidable protocol deviations during reporting and protects the credibility of the final conclusions.',
      'For sponsors and investigators, good trial statistics are not only about passing review. They improve operational clarity during study delivery and strengthen the usefulness of final evidence. When the design is coherent, implementation teams understand what data must be collected, programmers can build clean derivations, and clinicians can interpret results with confidence. High-quality trial statistics therefore serve both scientific validity and efficient trial execution, which is exactly what funders and healthcare partners expect from serious clinical research support.'
    ],
  },
  {
    slug: 'health-economics-cost-effectiveness-analysis',
    title: 'Health Economics and Cost-Effectiveness Analysis: Making Value Visible in Healthcare Decisions',
    datePublished: '2026-08-19',
    author: defaultAuthor,
    keywords: ['health economics', 'cost-effectiveness analysis', 'budget impact', 'HTA', 'public health value'],
    excerpt:
      'An applied guide to health economics and cost-effectiveness analysis for healthcare technologies, programmes, and donor-funded interventions.',
    summary:
      'Understand health economics and cost-effectiveness analysis with practical guidance on ICERs, budget impact, uncertainty analysis, and value communication.',
    codeLanguage: 'R',
    code: `library(heemod)\n\nparam <- define_parameters(\n  p_control = 0.62,\n  p_intervention = 0.74,\n  cost_control = 3200,\n  cost_intervention = 4100,\n  qaly_control = 0.68,\n  qaly_intervention = 0.79\n)\n\nicer <- with(param, (cost_intervention - cost_control) / (qaly_intervention - qaly_control))\nicer\n\nbudget_impact <- data.frame(\n  year = 1:3,\n  eligible_population = c(800, 860, 920),\n  uptake = c(0.35, 0.5, 0.65)\n)\nbudget_impact$annual_cost <- budget_impact$eligible_population * budget_impact$uptake * param$cost_intervention`,
    codeOutput: `Cost-effectiveness output

Incremental cost = 900
Incremental QALY = 0.11
ICER = 8,181.82 per QALY gained

Budget impact:
Year   Eligible   Uptake   Annual cost
1      800        0.35     1,148,000
2      860        0.50     1,763,000
3      920        0.65     2,451,800

Graph:
Cost-effectiveness plane with intervention in the higher-cost/higher-effect quadrant`,
    codeInterpretation:
      'The intervention increases both costs and health benefits, so value judgment depends on willingness-to-pay thresholds. The ICER provides a single efficiency metric, while budget impact shows affordability pressure as uptake grows over time. Decision-makers can use both views together to assess whether adoption is feasible and sustainable.',
    paragraphs: [
      'Health economics is increasingly central to decision-making because healthcare leaders must justify not only whether an intervention works, but whether it provides enough value for the resources it consumes. This is relevant across pharmaceuticals, diagnostics, digital health, prevention programmes, and delivery system reforms. Cost-effectiveness analysis offers a structured way to compare costs and outcomes, while budget impact analysis helps payers and programme managers assess affordability over time. Together, these methods make evidence more actionable for reimbursement, procurement, and programme design decisions.',
      'A robust economic evaluation starts with a clearly defined perspective, time horizon, and comparator. Analysts then identify the most appropriate outcome metric, whether that is cost per case detected, cost per death averted, or cost per quality-adjusted life year gained. For public health and HTA work, it is important to separate technical calculation from policy interpretation. An incremental cost-effectiveness ratio may look attractive, but decision-makers also need to understand implementation feasibility, equity implications, and financial consequences under realistic uptake assumptions.',
      'Uncertainty analysis is where health economics becomes especially valuable. Sensitivity analysis, scenario testing, and probabilistic approaches show how results change when assumptions move. This transparency is crucial when evidence is drawn from a mix of clinical studies, routine datasets, and expert opinion. For market access and donor negotiations, clear visual summaries of uncertainty often matter as much as the point estimate itself. Decision-makers are more likely to trust an economic model when they can see which assumptions drive the result and where additional evidence would reduce uncertainty.',
      'Well-executed health economics turns analytic complexity into a strategic advantage. It allows clients to communicate value to regulators, funders, and technical committees with a stronger evidence base. It also improves internal planning by showing where costs accumulate and where programme redesign may improve efficiency. For public health consultancies, economic evaluation is therefore not an isolated specialist service; it is a decision support framework that links outcomes, resources, and real-world implementation choices in a single, defensible narrative.'
    ],
  },
  {
    slug: 'data-management-best-practices',
    title: 'Data Management Best Practices for Public Health and Clinical Research Teams',
    datePublished: '2026-08-26',
    author: defaultAuthor,
    keywords: ['data management', 'REDCap', 'data quality', 'clinical research data', 'public health databases'],
    excerpt:
      'A practical checklist for clean, secure, analysis-ready public health and clinical research data, from database design to validation and audit readiness.',
    summary:
      'Adopt data management best practices for public health and clinical research with stronger database design, validation rules, coding standards, and audit trails.',
    codeLanguage: 'Stata',
    code: `use site_export.dta, clear\n\nassert inrange(age_years, 0, 120) if !missing(age_years)\nassert visit_date >= enrolment_date if !missing(visit_date, enrolment_date)\n\nduplicates report participant_id visit_number\n\ngen bmi = weight_kg / (height_m^2) if height_m > 0\nreplace bmi = . if bmi < 10 | bmi > 80\n\nmisstable summarize participant_id site_id outcome_date viral_load\nexport delimited using data_quality_findings.csv, replace`,
    codeOutput: `Data quality checks output

duplicates report participant_id visit_number
--------------------------------------------
copies | observations       surplus
--------------------------------------------
1      | 4,812              0
2      |   34              17
3      |    6               4
--------------------------------------------

misstable summarize
variable        obs<.
participant_id  4,852
site_id         4,850
outcome_date    4,601
viral_load      4,219

Graph:
Missingness bar chart by variable showing highest missingness in viral_load`,
    codeInterpretation:
      'The output highlights duplicate visit records and uneven missingness across key fields, which can bias estimates if left unresolved. Missing viral load values are the largest quality gap and should be prioritized for query resolution. Operationally, this supports a targeted data cleaning plan before analysis lock.',
    paragraphs: [
      'High-quality analysis depends on high-quality data, which is why data management should be treated as a scientific function rather than an administrative afterthought. In clinical research and public health programmes, weak database design and inconsistent data handling can delay reports, create avoidable protocol deviations, and undermine trust in results. Good data management protects projects at every stage, from instrument design and user permissions to query resolution and final database lock.',
      'The first best practice is to design data capture around the analysis and reporting requirements, not only around the questionnaire. Variables need consistent naming, clear coding conventions, and validation logic that prevents common entry errors. Date fields, skip patterns, range checks, and standard response options reduce downstream cleaning time substantially. In platforms such as REDCap, it is also important to think about audit trails, role-based access, branching logic, and form version control. These features improve data quality and create documentation that is useful during monitoring, sponsor review, and manuscript preparation.',
      'Routine quality review is equally important. Data managers should run regular checks for missingness, impossible values, duplicates, cross-form inconsistencies, and delayed submissions. The goal is not only to identify problems, but to feed corrections back to sites quickly enough that source verification remains possible. Many teams benefit from a structured data review calendar tied to enrolment milestones, interim analyses, or donor reporting deadlines. When quality checks are standardised and documented, the project becomes easier to scale across multiple sites without losing control of data integrity.',
      'Finally, good data management supports security and collaboration. Access should follow the principle of least privilege, sensitive identifiers should be separated where possible, and transfer procedures should be documented clearly. Clean data dictionaries and derivation notes make handover to analysts faster and safer. In practice, strong data management reduces rework, protects confidentiality, and accelerates time to insight. For consultancies supporting complex health studies, it is one of the highest-value investments a project can make.'
    ],
  },
  {
    slug: 'epidemiological-study-design',
    title: 'Epidemiological Study Design: Selecting Designs That Produce Defensible Evidence',
    datePublished: '2026-09-02',
    author: defaultAuthor,
    keywords: ['epidemiological study design', 'cohort studies', 'case-control', 'cross-sectional', 'public health research'],
    excerpt:
      'A practical overview of epidemiological study design choices for public health research, including cohort, case-control, cross-sectional, and quasi-experimental approaches.',
    summary:
      'Match epidemiological study design to the public health question by balancing feasibility, bias control, measurement quality, and analytic value.',
    codeLanguage: 'R',
    code: `library(epiR)\n\nexposure_table <- matrix(c(84, 126, 39, 151), nrow = 2, byrow = TRUE)\nepi.2by2(exposure_table, method = "cohort.count", conf.level = 0.95)\n\nsample_size <- power.prop.test(\n  p1 = 0.18,\n  p2 = 0.27,\n  power = 0.8,\n  sig.level = 0.05,\n  alternative = "two.sided"\n)\nsample_size`,
    codeOutput: `2x2 cohort output

                Outcome+  Outcome-
Exposed             84      126
Unexposed           39      151

Risk ratio = 1.95
95% CI     = 1.42 to 2.67
Attributable risk = 0.19

Sample size output:
n per group = 312
Power = 0.80 | Alpha = 0.05

Graph:
Forest-style plot of risk ratio with 95% confidence interval`,
    codeInterpretation:
      'The estimated risk ratio suggests the exposed group has nearly double the outcome risk compared with the unexposed group. Because the confidence interval remains above 1.0, the association is statistically compatible with increased risk. For planning, the sample size estimate shows the enrollment needed to test this difference with adequate power.',
    paragraphs: [
      'Good epidemiological study design starts with a disciplined research question. Too often, teams jump into data collection before deciding whether they need to estimate prevalence, identify determinants, compare incidence, or evaluate the effect of a programme change. The best design is the one that answers the decision question credibly within the ethical, operational, and budget constraints of the project. That may mean a cohort, case-control, cross-sectional, stepped-wedge, or interrupted time series approach rather than a single default template.',
      'Each design carries different strengths and vulnerabilities. Cross-sectional surveys are efficient for prevalence estimation and service assessments, but they do not establish temporal ordering well. Cohort studies are powerful for incidence and prognosis, especially when time-to-event analysis is required, yet they demand stronger follow-up systems and larger budgets. Case-control designs remain highly useful for rare outcomes or outbreak investigations, provided case definitions, control selection, and exposure measurement are handled carefully. For programme evaluation in real-world settings, quasi-experimental designs may be more feasible than randomisation while still providing useful causal insight.',
      'Bias prevention should be built into the design rather than repaired later in analysis. That means thinking early about confounding, measurement error, selection mechanisms, missing data, and cluster effects. Analysts and field teams should align on how exposures and outcomes will be defined, who will collect them, and how quality assurance will operate across sites. Even excellent statistical methods cannot fully rescue a study if the design has weak comparator groups or poorly standardised measurement.',
      'The strongest epidemiological studies are also the easiest to interpret because design, analysis, and reporting are aligned from the start. Clear inclusion criteria, defensible sample size assumptions, and a realistic analysis plan make the evidence more useful for policy and publication. For public health consultancies, this alignment is a major advantage: it reduces rework, improves ethics and funder submissions, and increases the chance that study findings will influence programmes rather than sit unused in a report.'
    ],
  },
  {
    slug: 'redcap-implementation-guide',
    title: 'REDCap Implementation Guide for Clinical and Public Health Research Programmes',
    datePublished: '2026-09-09',
    author: defaultAuthor,
    keywords: ['REDCap implementation', 'electronic data capture', 'clinical research', 'public health data systems', 'database design'],
    excerpt:
      'A field-ready REDCap implementation guide covering requirements gathering, instrument design, validation, user roles, and go-live support for research programmes.',
    summary:
      'Plan a stronger REDCap implementation for clinical and public health research with better instrument design, validation, governance, and training workflows.',
    codeLanguage: 'Stata',
    code: `import delimited using redcap_export.csv, clear\n\nforeach var of varlist consent_complete eligibility_complete followup_complete {\n  replace \`var' = . if \`var' == 99\n}\n\nlabel define complete_lbl 0 "Incomplete" 1 "Unverified" 2 "Complete"\nlabel values consent_complete complete_lbl\n\ncontract site_id repeat_instance\nlist if _freq > 1\n\nmerge 1:1 record_id using analysis_dataset.dta, nogen keep(match)`,
    codeOutput: `REDCap data processing output

Records imported: 2,406
Sentinel values recoded to missing:
- consent_complete: 23
- eligibility_complete: 17
- followup_complete: 41

Duplicate check (site_id x repeat_instance):
14 combinations with _freq > 1

Merge result (1:1 record_id):
Matched records: 2,301
Unmatched REDCap records: 105

Graph:
Stacked completion-status chart (Incomplete / Unverified / Complete) by site`,
    codeInterpretation:
      'The output confirms that data standardization steps were applied before analysis and identifies duplicate and unmatched records that require reconciliation. Site-level completion status helps teams focus training and monitoring where forms remain incomplete. In practical terms, this workflow improves downstream merge integrity and reporting reliability.',
    paragraphs: [
      'REDCap is one of the most effective platforms for health research data capture, but successful implementation depends on much more than building forms quickly. A good REDCap project begins with requirements gathering: what data are required, which users need access, how forms map to protocol visits, and what reports the team must produce. This planning stage is where many later issues can be prevented, especially duplicate fields, inconsistent coding, and workflows that do not match how data are collected in clinics or field settings.',
      'Instrument design should prioritise clarity, validation, and operational flow. Forms should follow the real visit sequence, minimise free text where coded options are better, and use branching logic carefully so users are not overwhelmed. Standard naming conventions and version control help the project remain manageable as amendments occur. Role-based permissions, logging, and data access groups are equally important because REDCap implementations often involve coordinators, monitors, analysts, and investigators with different responsibilities. Security and usability must be designed together rather than traded against each other.',
      'Implementation quality improves substantially when teams test the full workflow before launch. That includes user acceptance testing, pilot records, validation of calculations, export checks, and confirmation that downstream analysis scripts can read the data as intended. Training should be role-specific, brief enough to retain attention, and supported by quick reference guides. After go-live, project teams should monitor completion status, query trends, and recurring user errors so that improvements happen early instead of after months of low-quality capture.',
      'For clinical and public health programmes, REDCap works best when it is treated as a governed data system rather than a standalone form builder. Strong implementation reduces cleaning time, improves audit readiness, and makes reporting cycles more reliable. It also creates a better experience for site staff who need systems that are intuitive and resilient under operational pressure. That is why careful REDCap design remains one of the highest-leverage services a data management team can provide.'
    ],
  },
]

export const resources = [
  {
    category: 'R packages for statistical analysis',
    items: [
      {
        title: 'survival package',
        description: 'Core R package for survival analysis, Kaplan-Meier estimation, Cox regression, and recurrent event modelling in clinical research.',
        href: 'https://cran.r-project.org/package=survival',
      },
      {
        title: 'tidymodels',
        description: 'Unified modelling workflow for regression analysis, prediction, and reproducible health data science pipelines.',
        href: 'https://www.tidymodels.org/',
      },
      {
        title: 'heemod',
        description: 'Health economics package for Markov models, cost-effectiveness analysis, and uncertainty exploration.',
        href: 'https://cran.r-project.org/package=heemod',
      },
    ],
  },
  {
    category: 'Stata resources',
    items: [
      {
        title: 'Stata Survival Analysis Reference Manual',
        description: 'Official Stata documentation for survival-time data, parametric models, competing risks, and post-estimation.',
        href: 'https://www.stata.com/manuals/st.pdf',
      },
      {
        title: 'Stata Learning Portal',
        description: 'Curated Stata tutorials for regression analysis, epidemiology, graphics, and reproducible workflows.',
        href: 'https://www.stata.com/links/resources-for-learning-stata/',
      },
    ],
  },
  {
    category: 'Clinical trial design guides',
    items: [
      {
        title: 'ICH E9 Statistical Principles for Clinical Trials',
        description: 'Foundational guidance on estimands, bias control, trial analysis planning, and statistical integrity.',
        href: 'https://database.ich.org/sites/default/files/E9_Guideline.pdf',
      },
      {
        title: 'CONSORT Statement',
        description: 'Reporting guidance that improves transparency in randomised clinical trial design and statistical reporting.',
        href: 'https://www.consort-statement.org/',
      },
    ],
  },
  {
    category: 'Public health databases',
    items: [
      {
        title: 'WHO Global Health Observatory',
        description: 'Global public health indicators and country profiles useful for benchmarking, epidemiology, and health systems analysis.',
        href: 'https://www.who.int/data/gho',
      },
      {
        title: 'World Bank Data',
        description: 'Country-level demographic, financing, and development indicators that strengthen contextual health analysis.',
        href: 'https://data.worldbank.org/',
      },
      {
        title: 'Our World in Data Health Datasets',
        description: 'Accessible public health data visualisations and downloadable datasets for global health monitoring.',
        href: 'https://ourworldindata.org/health-meta',
      },
    ],
  },
  {
    category: 'Health economics tools',
    items: [
      {
        title: 'NICE Health Technology Evaluation resources',
        description: 'Methods and process guidance for economic evaluation, evidence submissions, and decision-making.',
        href: 'https://www.nice.org.uk/about/what-we-do/our-programmes/nice-guidance/nice-health-technology-evaluations',
      },
    ],
  },
]

export const faqs = [
  {
    question: 'What services does Bluetick Health offer?',
    answer:
      'Bluetick Health provides statistical analysis, data management, research support, project management, monitoring and evaluation, clinical trials support, and health economics consulting. Our work covers survival analysis, regression analysis, epidemiology, REDCap implementation, and evidence generation for researchers, NGOs, and health systems.',
  },
  {
    question: 'How do I request a consultation?',
    answer:
      'You can request a consultation by using the existing contact form, emailing the team directly, or calling to discuss your project scope. Sharing your research question, timelines, and data status early helps us recommend the most appropriate consulting pathway.',
  },
  {
    question: 'What data do you need to start a project?',
    answer:
      'The most useful starting package includes your study protocol or concept note, data dictionary, current dataset or sample extract, and the key decisions you need the analysis to support. For statistical analysis, we also recommend sharing primary outcomes, covariates, reporting deadlines, and any existing statistical analysis plan.',
  },
  {
    question: 'What timelines should I expect for statistical consulting?',
    answer:
      'Timelines depend on project complexity, data quality, and whether outputs include analysis, cleaning, dashboards, or manuscript support. Short advisory reviews may take a few days, while multi-site epidemiology, clinical trial, or health economics projects often require phased delivery over several weeks.',
  },
  {
    question: 'How are project costs determined?',
    answer:
      'Costs are typically based on the scope of work, technical complexity, expected turnaround time, and the mix of services involved. Survival analysis, regression modelling, REDCap builds, and health economics projects can each require different staffing profiles, so we provide tailored quotations after initial scoping.',
  },
  {
    question: 'What technical requirements are needed for collaboration?',
    answer:
      'Most projects can begin with secure file sharing, a clear data dictionary, and a short kickoff meeting. Where needed, we can align with existing R, Stata, REDCap, or reporting workflows so that outputs integrate smoothly into your research or programme environment.',
  },
  {
    question: 'How do you protect data security and confidentiality?',
    answer:
      'Data security and confidentiality are treated as core delivery requirements. We work with role-based access, documented transfer procedures, de-identification where appropriate, and clear handling expectations for sensitive clinical and public health data throughout the consulting lifecycle.',
  },
  {
    question: 'Can you support universities, NGOs, and health system partnerships?',
    answer:
      'Yes. Bluetick Health regularly positions its services for university partnerships, NGO implementation support, and health system strengthening. Our consulting model is designed to support publishable research, operational decision-making, and evidence generation that external partners can confidently reference and share.',
  },
]

export const vacanciesContent = {
  placeholder:
    "Currently, we have no open positions. We're always looking for talented individuals. Check back soon or contact us to express interest.",
  contactEmail: 'mitikuhermanng@gmail.com',
  contactPhone: '+27 611170478',
  jobs: [],
}

export const productsContent = {
  heading: 'Products & Digital Solutions',
  intro:
    'Bluetick Health is expanding into healthcare digital solutions development to support stronger clinical workflows, data quality, and evidence-driven decision-making.',
  partnershipMessage: 'We will be developing healthcare digital solutions through partnership in the coming years.',
  products: [
    {
      name: 'Bluetick Health EMR',
      description:
        'A comprehensive Digital Health Solution for electronic medical records management, supporting secure patient data capture, clinical workflows, and reporting.',
      status: 'Coming Soon',
      category: 'Electronic Medical Records',
      logo: '/assets/bluetick-globe.png',
    },
  ],
}

export const bluetickNewsItems = [
  {
    date: '2026-08-31',
    title: 'Bluetick Health launches expanded research blog library',
    summary:
      'Bluetick Health published a new set of practical articles covering survival analysis, regression modelling, time series analytics, REDCap implementation, and health economics.',
    link: '/blog/',
    source: 'Bluetick Health',
    category: 'Company update',
  },
  {
    date: '2026-08-31',
    title: 'New FAQ and resources pages released for client support',
    summary:
      'The website now includes an expanded FAQ and curated resources page to help research teams quickly access methods guidance and reference tools.',
    link: '/faq/',
    source: 'Bluetick Health',
    category: 'Website update',
  },
  {
    date: '2026-08-31',
    title: 'Clinical trial statistics article featured in latest blog updates',
    summary:
      'The latest featured article explains how robust trial design, sample size assumptions, and statistical analysis plans improve evidence quality and decision-making.',
    link: '/blog/clinical-trial-design-and-statistics/',
    source: 'Bluetick Health',
    category: 'Blog highlight',
  },
]

export const globalHealthNewsItems = [
  {
    date: '2026-08-28',
    title: 'WHO and UNICEF report progress and gaps in global immunization coverage',
    summary:
      'Latest WHO/UNICEF estimates show continuing recovery in childhood immunization coverage, while highlighting persistent zero-dose and equity gaps across regions.',
    link: 'https://www.who.int/news-room',
    source: 'WHO / UNICEF',
    category: 'Public health trends',
    relevance: 'Supports consulting on vaccination programme monitoring, equity targeting, and service recovery planning.',
  },
  {
    date: '2026-08-22',
    title: 'Africa CDC updates priorities on mpox and integrated outbreak response',
    summary:
      'Africa CDC communications emphasize coordinated surveillance, lab capacity, and emergency response support for mpox and other cross-border threats.',
    link: 'https://africacdc.org/news/',
    source: 'Africa CDC',
    category: 'Health policy update',
    relevance: 'Relevant for outbreak analytics, preparedness advisory work, and cross-country public health programme design.',
  },
  {
    date: '2026-08-20',
    title: 'The Lancet highlights new evidence on hypertension care models in Africa',
    summary:
      'Recent publications discuss scalable service delivery approaches for hypertension diagnosis, treatment retention, and outcomes improvement in African settings.',
    link: 'https://www.thelancet.com/global-health',
    source: 'The Lancet Global Health',
    category: 'Research breakthrough',
    relevance: 'Informs evaluation frameworks and statistical planning for non-communicable disease programmes.',
  },
  {
    date: '2026-08-18',
    title: 'WHO updates guidance on digital health and data use for stronger systems',
    summary:
      'New WHO guidance and updates continue to strengthen the case for interoperable digital health architecture, data quality, and governance.',
    link: 'https://www.who.int/teams/digital-health-and-innovation',
    source: 'World Health Organization',
    category: 'Health systems',
    relevance: 'Directly relevant to data governance consulting, routine data quality improvement, and digital reporting strategy.',
  },
  {
    date: '2026-08-15',
    title: 'NIH reports clinical trial advances in HIV prevention and long-acting options',
    summary:
      'NIH research updates continue to expand evidence on prevention efficacy, implementation barriers, and programme readiness for long-acting interventions.',
    link: 'https://www.nih.gov/news-events/news-releases',
    source: 'U.S. National Institutes of Health',
    category: 'Clinical trial news',
    relevance: 'Useful for protocol development, endpoint strategy, and translation of trial evidence into implementation plans.',
  },
  {
    date: '2026-08-12',
    title: 'World Bank data updates track health financing and service coverage indicators',
    summary:
      'Recent updates to country indicators provide new comparative data on health spending, service access, and system performance in low- and middle-income settings.',
    link: 'https://data.worldbank.org/topic/health',
    source: 'World Bank',
    category: 'Statistics release',
    relevance: 'Supports benchmarking, context analysis, and evidence framing for grant applications and policy briefs.',
  },
]

export const pageContent = {
  '/blog/': {
    title: 'Bluetick Health Blog | Public Health Statistics, Clinical Research, and Health Economics',
    description:
      'Explore Bluetick Health blog articles on survival analysis, regression analysis, clinical trial design, REDCap implementation, epidemiology, time series analysis, and health economics.',
    keywords:
      'Bluetick Health blog, survival analysis, regression analysis, clinical trial statistics, epidemiology, REDCap implementation, health economics',
    heading: 'Blog',
    intro:
      'SEO-focused articles designed for researchers, clinical teams, and public health programmes seeking practical guidance in statistical analysis, epidemiology, health economics, and data management.',
  },
  '/resources/': {
    title: 'Resources and Tools | R Packages, Stata Guides, Clinical Trial Resources',
    description:
      'Browse curated resources for statistical analysis, Stata, clinical trial design, public health databases, and health economics tools.',
    keywords:
      'R packages, Stata resources, clinical trial design guides, public health databases, health economics tools',
    heading: 'Resources & Tools',
    intro:
      'A curated set of trusted references, packages, databases, and implementation guides that researchers and programme teams can cite, share, and build into their own workflows.',
  },
  '/faq/': {
    title: 'FAQ | Public Health Statistical Consulting Questions',
    description:
      'Frequently asked questions about Bluetick Health services, consultation requests, timelines, data requirements, costs, and data security.',
    keywords:
      'public health consulting FAQ, statistical consulting questions, clinical research support, data security, project timelines',
    heading: 'Frequently Asked Questions',
    intro:
      'Answers to common questions about public health statistical consulting, research support, timelines, data preparation, and secure collaboration.',
  },
  '/vacancies/': {
    title: 'Vacancies | Bluetick Health',
    description:
      'Explore future careers at Bluetick Health across public health jobs, biostatistician positions, and research careers. We currently have no open positions.',
    keywords: 'public health jobs, biostatistician positions, research careers, careers at Bluetick Health',
    heading: 'Vacancies',
    intro:
      'Careers at Bluetick Health for public health jobs, biostatistician positions, and research careers. No roles are currently open, but we welcome interest for future opportunities.',
  },
  '/news/': {
    title: 'News | Bluetick Health',
    description:
      'Read Bluetick Health company updates and curated global and African public health updates, research news, and policy developments.',
    keywords: 'health news Africa, public health updates, research news, global health trends',
    heading: 'News',
    intro:
      'Stay current with Bluetick Health updates alongside curated global and African health news relevant to research, consulting, and programme delivery.',
  },
  '/products/': {
    title: 'Products & Digital Health Solutions | Bluetick Health',
    description:
      'Explore Bluetick Health healthcare digital solutions and upcoming EMR software plans, including future digital health products and health apps developed through strategic partnerships.',
    keywords:
      'healthcare digital solutions, electronic medical records, EMR software, digital health, health apps, healthcare technology',
    heading: 'Products & Digital Solutions',
    intro:
      'Explore upcoming Bluetick Health products and Digital Health Solutions designed to strengthen healthcare delivery and data-driven care.',
  },
}

export function getPostPath(slug) {
  return `/blog/${slug}/`
}

export function getPageMeta(pathname) {
  if (pathname === '/') {
    return {
      title: 'Bluetick Health | Statistical & Public Health Consultancy',
      description:
        'Independent statistical and public health research consultancy based in South Africa. Expert services in statistical analysis, clinical trials support, health economics, data management, and monitoring & evaluation.',
      keywords:
        'statistical analysis, public health consulting, clinical trials support, health economics, survival analysis, regression analysis, time series analysis, REDCap, epidemiology',
      type: 'website',
      structuredData: {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'LocalBusiness',
            '@id': `${siteUrl}/#organization`,
            name: siteName,
            description:
              'Independent statistical and public health research consultancy supporting health systems, clinical research, NGOs, and academic institutions across South Africa and globally.',
            url: `${siteUrl}/`,
            logo: `${siteUrl}/assets/bluetick-globe.png`,
            image: `${siteUrl}/assets/bluetick-globe.png`,
            telephone: '+27611170478',
            email: 'mitikuhermanng@gmail.com',
            address: {
              '@type': 'PostalAddress',
              addressCountry: 'ZA',
              addressRegion: 'South Africa',
            },
            areaServed: ['South Africa', 'Sub-Saharan Africa', 'Global'],
            sameAs: ['https://www.linkedin.com/company/bluetick-health'],
            contactPoint: {
              '@type': 'ContactPoint',
              telephone: '+27611170478',
              email: 'mitikuhermanng@gmail.com',
              contactType: 'customer service',
              availableLanguage: 'English',
            },
            hasOfferCatalog: {
              '@type': 'OfferCatalog',
              name: 'Public Health Consulting Services',
              itemListElement: [
                'Statistical Analysis',
                'Data Management',
                'Research Support',
                'Project Management',
                'Monitoring & Evaluating Public Health Programs',
                'Clinical Trials Support',
                'Health Economics & Economic Evaluation',
              ].map((service) => ({
                '@type': 'Offer',
                itemOffered: {
                  '@type': 'Service',
                  name: service,
                },
              })),
            },
          },
        ],
      },
    }
  }

  const post = blogPosts.find((entry) => getPostPath(entry.slug) === pathname)
  if (post) {
    return {
      title: `${post.title} | Bluetick Health Blog`,
      description: post.summary,
      keywords: post.keywords.join(', '),
      type: 'article',
      article: post,
      structuredData: {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: post.title,
        description: post.summary,
        datePublished: post.datePublished,
        author: {
          '@type': 'Organization',
          name: post.author,
        },
        publisher: {
          '@type': 'Organization',
          name: siteName,
          logo: {
            '@type': 'ImageObject',
            url: `${siteUrl}/assets/bluetick-globe.png`,
          },
        },
        keywords: post.keywords.join(', '),
        mainEntityOfPage: `${siteUrl}${getPostPath(post.slug)}`,
      },
    }
  }

  const page = pageContent[pathname]
  if (page) {
    return {
      title: page.title,
      description: page.description,
      keywords: page.keywords,
      type: 'website',
      structuredData: {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: page.heading,
        description: page.description,
        url: `${siteUrl}${pathname}`,
      },
    }
  }

  return getPageMeta('/')
}
